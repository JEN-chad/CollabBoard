import Board from '../models/Board.js';
import User from '../models/User.js';
import Card from '../models/Card.js';

// @desc    Get all boards for logged-in user (owned or member)
// @route   GET /api/boards
// @access  Private
export const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      $or: [
        { ownerId: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
      .populate('ownerId', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 });

    // Fetch card details to calculate task stats and last updated timestamp for each board
    const boardIds = boards.map((b) => b._id);
    const cards = await Card.find({ boardId: { $in: boardIds } })
      .populate('assignee', 'name email');

    // Map cards to board IDs
    const boardCardsMap = {};
    cards.forEach((card) => {
      const bId = card.boardId.toString();
      if (!boardCardsMap[bId]) {
        boardCardsMap[bId] = [];
      }
      boardCardsMap[bId].push(card);
    });

    const enrichedBoards = boards.map((board) => {
      const boardObj = board.toObject();
      const boardCards = boardCardsMap[board._id.toString()] || [];
      
      boardObj.taskCount = boardCards.length;
      boardObj.completedCount = boardCards.filter((c) => c.columnId === 'done').length;
      boardObj.cards = boardCards;

      // Find the latest updated time between the board and its cards
      let latestUpdated = board.updatedAt;
      boardCards.forEach((c) => {
        if (c.updatedAt > latestUpdated) {
          latestUpdated = c.updatedAt;
        }
      });
      boardObj.lastUpdated = latestUpdated;

      return boardObj;
    });

    res.status(200).json(enrichedBoards);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      res.status(400);
      return next(new Error('Please add a board title'));
    }

    const board = await Board.create({
      title,
      description: description || '',
      ownerId: req.user._id,
      members: []
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('ownerId', 'name email')
      .populate('members.user', 'name email');

    res.status(201).json(populatedBoard);
  } catch (error) {
    next(error);
  }
};

// @desc    Get board by ID
// @route   GET /api/boards/:id
// @access  Private
export const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('members.user', 'name email');

    if (!board) {
      res.status(404);
      return next(new Error('Board not found'));
    }

    // Check if user is owner or member
    const isOwner = board.ownerId._id.toString() === req.user._id.toString();
    const isMember = board.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      res.status(403);
      return next(new Error('Not authorized to access this board'));
    }

    // Fetch board cards, populated with assignee and sorted by position
    const cards = await Card.find({ boardId: board._id })
      .populate('assignee', 'name email')
      .sort({ position: 1 });

    const boardObj = board.toObject();
    boardObj.cards = cards;
    boardObj.taskCount = cards.length;
    boardObj.completedCount = cards.filter((c) => c.columnId === 'done').length;

    let latestUpdated = board.updatedAt;
    cards.forEach((c) => {
      if (c.updatedAt > latestUpdated) {
        latestUpdated = c.updatedAt;
      }
    });
    boardObj.lastUpdated = latestUpdated;

    res.status(200).json(boardObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Update board details (only Owner can update details/members)
// @route   PUT /api/boards/:id
// @access  Private
export const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      res.status(404);
      return next(new Error('Board not found'));
    }

    // Only Owner is authorized to edit board
    const isOwner = board.ownerId.toString() === req.user._id.toString();
    if (!isOwner) {
      res.status(403);
      return next(new Error('Only the board owner can update board details or manage members'));
    }

    const { title, description, inviteEmail, inviteRole, removeUserId, updateUserId, updateRole } = req.body;

    // 1. Update basic details if provided
    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;

    // 2. Handle inviting a member by email
    if (inviteEmail) {
      const emailLower = inviteEmail.trim().toLowerCase();
      const userToInvite = await User.findOne({ email: emailLower });
      if (!userToInvite) {
        res.status(404);
        return next(new Error(`User with email "${inviteEmail}" not found`));
      }

      // Check if already owner or member
      const isAlreadyOwner = board.ownerId.toString() === userToInvite._id.toString();
      const isAlreadyMember = board.members.some(
        (m) => m.user.toString() === userToInvite._id.toString()
      );

      if (isAlreadyOwner) {
        res.status(400);
        return next(new Error('User is the owner of this board'));
      }
      if (isAlreadyMember) {
        res.status(400);
        return next(new Error('User is already a member of this board'));
      }

      board.members.push({
        user: userToInvite._id,
        role: inviteRole || 'Editor'
      });
    }

    // 3. Handle removing a member
    if (removeUserId) {
      board.members = board.members.filter(
        (m) => m.user.toString() !== removeUserId.toString()
      );
    }

    // 4. Handle updating a member's role
    if (updateUserId && updateRole) {
      const member = board.members.find(
        (m) => m.user.toString() === updateUserId.toString()
      );
      if (member) {
        member.role = updateRole;
      } else {
        res.status(404);
        return next(new Error('Member not found to update role'));
      }
    }

    await board.save();

    // Fetch updated populated board
    const updatedBoard = await Board.findById(board._id)
      .populate('ownerId', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete board (only Owner can delete)
// @route   DELETE /api/boards/:id
// @access  Private
export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      res.status(404);
      return next(new Error('Board not found'));
    }

    // Only Owner is authorized to delete board
    const isOwner = board.ownerId.toString() === req.user._id.toString();
    if (!isOwner) {
      res.status(403);
      return next(new Error('Only the board owner can delete this board'));
    }

    await board.deleteOne();

    res.status(200).json({ message: 'Board deleted successfully', boardId: req.params.id });
  } catch (error) {
    next(error);
  }
};
