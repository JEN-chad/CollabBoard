import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Card from '../models/Card.js';
import Activity from '../models/Activity.js';
import { logActivity } from '../controllers/activityController.js';

const boardSocket = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication auth token missing'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication user not found'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      console.warn(`[Socket Auth failed]: ${err.message}`);
      return next(new Error('Authentication failed: Invalid token'));
    }
  });

  const updatePresence = async (boardId) => {
    try {
      const sockets = await io.in(boardId.toString()).fetchSockets();
      const onlineUsers = [];
      const seenUsers = new Set();
      
      for (const s of sockets) {
        if (s.user && !seenUsers.has(s.user._id.toString())) {
          seenUsers.add(s.user._id.toString());
          onlineUsers.push({
            _id: s.user._id,
            name: s.user.name,
            email: s.user.email,
          });
        }
      }
      
      io.to(boardId.toString()).emit('presence:update', { boardId, users: onlineUsers });
      console.log(`[Socket Presence] Broadcasted ${onlineUsers.length} online users for board ${boardId}`);
    } catch (err) {
      console.error(`[Socket Presence Error] failed to update presence: ${err.message}`);
    }
  };

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user?.name})`);

    // Join a board room
    socket.on('board:join', async (boardId) => {
      if (boardId) {
        socket.join(boardId);
        socket.currentBoardId = boardId;
        console.log(`Socket ${socket.id} (User: ${socket.user?.name}) joined board room: ${boardId}`);

        // Log join activity with spam protection (only log if no recent "joined" in the last 5 minutes)
        if (socket.user) {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const recentJoin = await Activity.findOne({
            boardId,
            user: socket.user._id,
            action: 'joined',
            createdAt: { $gte: fiveMinutesAgo }
          });

          if (!recentJoin) {
            await logActivity({
              boardId,
              userId: socket.user._id,
              action: 'joined',
              io
            });
          }
        }

        // Update presence
        await updatePresence(boardId);
      }
    });

    // Leave a board room
    socket.on('board:leave', async (boardId) => {
      if (boardId) {
        socket.leave(boardId);
        socket.currentBoardId = null;
        console.log(`Socket ${socket.id} (User: ${socket.user?.name}) left board room: ${boardId}`);
        await updatePresence(boardId);
      }
    });

    // Real-time card creation
    socket.on('card:create', (data) => {
      if (data && data.boardId && data.card) {
        socket.to(data.boardId).emit('card:create', data.card);
        console.log(`Broadcast card:create on board ${data.boardId} for card ${data.card._id}`);
      }
    });

    // Real-time card update
    socket.on('card:update', async (data) => {
      if (!data) return;

      // Check if this is a conflict-checked direct update
      if (data.cardId && data.version !== undefined) {
        const { cardId, boardId, columnId, position, version, title, description, priority, assignee } = data;

        try {
          const card = await Card.findById(cardId);
          if (!card) {
            socket.emit('card:error', { message: 'Card not found', cardId });
            return;
          }

          // Compare versions
          if (Number(version) !== card.version) {
            console.log(`[Socket Conflict] card:update rejected for ${cardId}. Client version: ${version}, DB version: ${card.version}`);
            const latestCard = await Card.findById(cardId).populate('assignee', 'name email');
            socket.emit('card:conflict', {
              message: 'Conflict detected: This card has been modified by another user.',
              cardId,
              card: latestCard,
            });
            return;
          }

          // Versions match - apply update
          // Handle position shifts if column/position changed
          let isMove = false;
          let oldCol = card.columnId;
          let newCol = columnId;

          if (columnId !== undefined && position !== undefined && (columnId !== card.columnId || position !== card.position)) {
            isMove = true;
            if (oldCol === newCol) {
              if (position > card.position) {
                await Card.updateMany(
                  { boardId: card.boardId, columnId: oldCol, position: { $gt: card.position, $lte: position } },
                  { $inc: { position: -1 } }
                );
              } else if (position < card.position) {
                await Card.updateMany(
                  { boardId: card.boardId, columnId: oldCol, position: { $gte: position, $lt: card.position } },
                  { $inc: { position: 1 } }
                );
              }
            } else {
              await Card.updateMany(
                { boardId: card.boardId, columnId: oldCol, position: { $gt: card.position } },
                { $inc: { position: -1 } }
              );
              await Card.updateMany(
                { boardId: card.boardId, columnId: newCol, position: { $gte: position } },
                { $inc: { position: 1 } }
              );
            }

            card.columnId = newCol;
            card.position = position;
          }

          if (title !== undefined) card.title = title;
          if (description !== undefined) card.description = description;
          if (priority !== undefined) card.priority = priority;
          if (assignee !== undefined) card.assignee = assignee || null;

          // Increment version and save
          card.version = card.version + 1;
          await card.save();

          const populatedCard = await Card.findById(card._id).populate('assignee', 'name email');
          
          // Log activity
          if (socket.user) {
            if (isMove) {
              await logActivity({
                boardId,
                userId: socket.user._id,
                action: 'moved',
                cardId: card._id,
                cardTitle: card.title,
                details: { fromCol: oldCol, toCol: newCol },
                io
              });
            } else {
              await logActivity({
                boardId,
                userId: socket.user._id,
                action: 'updated',
                cardId: card._id,
                cardTitle: card.title,
                io
              });
            }
          }

          // Broadcast to everyone in the board room (including the sender, to sync version number)
          io.to(boardId).emit('card:update', populatedCard);
          console.log(`[Socket Success] card:update for card ${cardId}. New version: ${populatedCard.version}`);
        } catch (error) {
          console.error('[Socket Error] failed to update card:', error);
          socket.emit('card:error', { message: 'Failed to update card', cardId });
        }
      } 
      // Handle the fallback broadcast format: { boardId, card }
      else if (data.boardId && data.card) {
        socket.to(data.boardId).emit('card:update', data.card);
        console.log(`Broadcast card:update on board ${data.boardId} for card ${data.card._id}`);
      }
    });

    // Real-time card movement (for optimistic UI shifts)
    socket.on('card:move', (data) => {
      if (data && data.boardId && data.cardId) {
        socket.to(data.boardId).emit('card:move', data);
        console.log(`Broadcast card:move on board ${data.boardId} for card ${data.cardId}`);
      }
    });

    // Real-time card deletion
    socket.on('card:delete', (data) => {
      if (data && data.boardId && data.cardId) {
        socket.to(data.boardId).emit('card:delete', data);
        console.log(`Broadcast card:delete on board ${data.boardId} for card ${data.cardId}`);
      }
    });

    socket.on('disconnecting', () => {
      socket.roomsToLeave = Array.from(socket.rooms).filter((r) => r !== socket.id);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.roomsToLeave) {
        for (const room of socket.roomsToLeave) {
          await updatePresence(room);
        }
      }
    });
  });
};

export default boardSocket;
