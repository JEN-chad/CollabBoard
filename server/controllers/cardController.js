import Card from '../models/Card.js';
import Board from '../models/Board.js';
import { logActivity } from './activityController.js';

// Helper function to check if user has edit permissions (Owner or Editor)
const checkEditPermission = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return { allowed: false, status: 404, message: 'Board not found' };

  const isOwner = board.ownerId.toString() === userId.toString();
  const member = board.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  
  const isEditor = member && (member.role === 'Editor' || member.role === 'Owner');

  if (isOwner || isEditor) {
    return { allowed: true, board };
  }

  return { allowed: false, status: 403, message: 'Not authorized: You must be an Editor or Owner to perform this action' };
};

// @desc    Create a card
// @route   POST /api/cards
// @access  Private
export const createCard = async (req, res, next) => {
  try {
    const { title, description, priority, assignee, boardId, columnId, dueDate } = req.body;

    if (!title || !boardId || !columnId) {
      res.status(400);
      return next(new Error('Please provide title, boardId, and columnId'));
    }

    // Check permission
    const permission = await checkEditPermission(boardId, req.user._id);
    if (!permission.allowed) {
      res.status(permission.status);
      return next(new Error(permission.message));
    }

    // Determine position: count cards in this column and append
    const cardCount = await Card.countDocuments({ boardId, columnId });
    const position = cardCount;

    const card = await Card.create({
      title,
      description: description || '',
      priority: priority || 'medium',
      assignee: assignee || null,
      boardId,
      columnId,
      position,
      dueDate: dueDate || null,
      version: 1,
      updatedBy: req.user._id,
    });

    const populatedCard = await Card.findById(card._id).populate('assignee', 'name email');

    // Log Activity
    await logActivity({
      boardId: card.boardId,
      userId: req.user._id,
      action: 'created',
      cardId: card._id,
      cardTitle: card.title,
      io: req.app.get('io')
    });

    res.status(201).json(populatedCard);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a card (with version conflict resolution)
// @route   PUT /api/cards/:id
// @access  Private
export const updateCard = async (req, res, next) => {
  try {
    const { title, description, priority, assignee, columnId, position, version, dueDate } = req.body;

    const card = await Card.findById(req.params.id);
    if (!card) {
      res.status(404);
      return next(new Error('Card not found'));
    }

    // Check permission
    const permission = await checkEditPermission(card.boardId, req.user._id);
    if (!permission.allowed) {
      res.status(permission.status);
      return next(new Error(permission.message));
    }

    // 1. Conflict Resolution Check
    // If client sends a version, compare it with the current card version in the DB
    if (version !== undefined && Number(version) !== card.version) {
      // Fetch latest card with assignee populated to return to client
      const latestCard = await Card.findById(card._id).populate('assignee', 'name email');
      res.status(409); // Conflict status
      return res.json({
        message: 'Conflict detected: This card has been modified by another user. Reverting to latest state.',
        card: latestCard,
      });
    }

    let isMove = false;
    let oldCol = card.columnId;
    let newCol = columnId;

    // 2. Handle position / column changes if supplied
    if (columnId !== undefined && position !== undefined && (columnId !== card.columnId || position !== card.position)) {
      isMove = true;
      const oldPos = card.position;
      const newPos = position;

      if (oldCol === newCol) {
        // Same column reorder
        if (newPos > oldPos) {
          // Moved down: decrement positions of cards between oldPos + 1 and newPos
          await Card.updateMany(
            { boardId: card.boardId, columnId: oldCol, position: { $gt: oldPos, $lte: newPos } },
            { $inc: { position: -1 } }
          );
        } else if (newPos < oldPos) {
          // Moved up: increment positions of cards between newPos and oldPos - 1
          await Card.updateMany(
            { boardId: card.boardId, columnId: oldCol, position: { $gte: newPos, $lt: oldPos } },
            { $inc: { position: 1 } }
          );
        }
      } else {
        // Different column move
        // Shift down remaining cards in old column
        await Card.updateMany(
          { boardId: card.boardId, columnId: oldCol, position: { $gt: oldPos } },
          { $inc: { position: -1 } }
        );
        // Shift up cards in new column to make room
        await Card.updateMany(
          { boardId: card.boardId, columnId: newCol, position: { $gte: newPos } },
          { $inc: { position: 1 } }
        );
      }

      card.columnId = newCol;
      card.position = newPos;
    }

    // 3. Update text/other fields
    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (priority !== undefined) card.priority = priority;
    if (assignee !== undefined) card.assignee = assignee || null;
    if (dueDate !== undefined) card.dueDate = dueDate || null;

    // Increment version upon update
    card.version = card.version + 1;
    card.updatedBy = req.user._id;

    await card.save();

    const updatedCard = await Card.findById(card._id).populate('assignee', 'name email');

    // Log Activity
    if (isMove) {
      await logActivity({
        boardId: card.boardId,
        userId: req.user._id,
        action: 'moved',
        cardId: card._id,
        cardTitle: card.title,
        details: { fromCol: oldCol, toCol: newCol },
        io: req.app.get('io')
      });
    } else {
      await logActivity({
        boardId: card.boardId,
        userId: req.user._id,
        action: 'updated',
        cardId: card._id,
        cardTitle: card.title,
        io: req.app.get('io')
      });
    }

    res.status(200).json(updatedCard);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a card
// @route   DELETE /api/cards/:id
// @access  Private
export const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      res.status(404);
      return next(new Error('Card not found'));
    }

    // Check permission
    const permission = await checkEditPermission(card.boardId, req.user._id);
    if (!permission.allowed) {
      res.status(permission.status);
      return next(new Error(permission.message));
    }

    const { boardId, columnId, position } = card;

    // Log Activity
    await logActivity({
      boardId: card.boardId,
      userId: req.user._id,
      action: 'deleted',
      cardId: card._id,
      cardTitle: card.title,
      io: req.app.get('io')
    });

    await card.deleteOne();

    // Reorder subsequent cards in the same column to fill the gap
    await Card.updateMany(
      { boardId, columnId, position: { $gt: position } },
      { $inc: { position: -1 } }
    );

    res.status(200).json({ message: 'Card deleted successfully', cardId: req.params.id });
  } catch (error) {
    next(error);
  }
};
