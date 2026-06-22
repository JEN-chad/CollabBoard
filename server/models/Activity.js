import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'moved', 'joined'],
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      default: null,
    },
    cardTitle: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly query board activities sorted by date
activitySchema.index({ boardId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
