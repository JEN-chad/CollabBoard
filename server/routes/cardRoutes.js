import express from 'express';
import {
  createCard,
  updateCard,
  deleteCard,
} from '../controllers/cardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All card routes require authentication
router.use(protect);

router.route('/')
  .post(createCard);

router.route('/:id')
  .put(updateCard)
  .delete(deleteCard);

export default router;
