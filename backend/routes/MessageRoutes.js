import express from 'express';
import { 
  sendTemplateMessage, logIncomingMessage, getConversation, 
} from '../controllers/MessageController.js';

const router = express.Router();

// Send template
router.post('/send', sendTemplateMessage);

// Webhook to receive WhatsApp replies
router.post('/webhook', logIncomingMessage);

// Get conversation
router.get('/:contactId', getConversation);

// // Delete single message
// router.delete('/:id', deleteMessage);

// // Delete all messages for a contact
// router.delete('/contact/:contactId', deleteMessagesByContact);

export default router;