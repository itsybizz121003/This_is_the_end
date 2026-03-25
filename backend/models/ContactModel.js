// models/Contact.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String, // E.164 format e.g., +919876543210
    required: true,
    unique: true,
  },
  source: {
    type: String,
    enum: ['manual', 'meta_form'],
    default: 'manual',
  },
  optIn: {
    type: Boolean,
    default: false, // true if user agreed to receive messages
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Contact', contactSchema);