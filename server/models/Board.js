import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a board title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['Owner', 'Editor', 'Viewer'],
          default: 'Editor',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Board = mongoose.model('Board', boardSchema);
export default Board;
