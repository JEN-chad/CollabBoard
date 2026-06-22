import express from 'express';
import {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
} from '../controllers/boardController.js';
import { getBoardActivities, getWorkspaceActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All board routes require authentication
router.use(protect);

router.route('/')
  .get(getBoards)
  .post(createBoard);

router.route('/activities/recent')
  .get(getWorkspaceActivities);

router.route('/:id')
  .get(getBoardById)
  .put(updateBoard)
  .delete(deleteBoard);

router.route('/:id/activities')
  .get(getBoardActivities);

export default router;
