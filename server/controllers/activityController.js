import Activity from '../models/Activity.js';
import Board from '../models/Board.js';

/**
 * Creates and saves a new activity log, and broadcasts it to the room.
 */
export const logActivity = async ({ boardId, userId, action, cardId, cardTitle, details, io }) => {
  try {
    const activity = await Activity.create({
      boardId,
      user: userId,
      action,
      cardId: cardId || null,
      cardTitle: cardTitle || '',
      details: details || {},
    });

    const populated = await Activity.findById(activity._id).populate('user', 'name email');

    if (io) {
      io.to(boardId.toString()).emit('activity:new', populated);
    }
    return populated;
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

/**
 * Retrieves the latest 50 activities for a given board ID.
 */
export const getBoardActivities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activities = await Activity.find({ boardId: id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves the latest 15 activities across all boards accessible by the user.
 */
export const getWorkspaceActivities = async (req, res, next) => {
  try {
    const boards = await Board.find({
      $or: [
        { ownerId: req.user._id },
        { 'members.user': req.user._id }
      ]
    });
    const boardIds = boards.map(b => b._id);

    const activities = await Activity.find({ boardId: { $in: boardIds } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json(activities);
  } catch (err) {
    next(err);
  }
};
