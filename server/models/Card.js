import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a card title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    columnId: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      required: true,
      default: 'todo',
    },
    position: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Mongo deprecation warnings or helper index to quickly query cards per board
cardSchema.index({ boardId: 1, columnId: 1, position: 1 });

const Card = mongoose.model('Card', cardSchema);
export default Card;
