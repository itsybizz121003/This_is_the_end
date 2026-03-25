    // models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  type: {
    type: String,
    enum: ['template', 'text'],
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    enum: ['outgoing', 'incoming'],
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'read'],
    default: 'sent',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Message', messageSchema);