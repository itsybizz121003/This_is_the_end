// models/MessageTemplate.js
import mongoose from 'mongoose';

const messageTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Template name used in WhatsApp API
    unique: true,
  },
  language: {
    type: String,
    default: 'en_US', // e.g., 'en', 'hi'
  },
  body: {
    type: String,
    required: true, // Template text with placeholders like {{name}}
  },
  approved: {
    type: Boolean,
    default: false, // Only approved templates can be sent
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('MessageTemplate', messageTemplateSchema);