const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'code', 'file', 'image', 'system'],
      default: 'text',
    },
    codeLanguage: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    fileType: {
      type: String,
    },
    // Reply feature
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Reactions feature
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: {
          type: String, // '👍', '❤️', '😂', '😮', '😢', '🙏', etc.
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Edit feature
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    // Delete feature
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);