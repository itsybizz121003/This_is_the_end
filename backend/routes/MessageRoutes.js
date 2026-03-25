import express from 'express';
import { 
  sendTemplateMessage, handleWebhook, verifyWebhook, getConversation, sendMessage, getAllMessages
} from '../controllers/MessageController.js';

const router = express.Router();

// Get all messages (global history)
router.get('/', getAllMessages);

// Send individual text message
router.post('/send-message', sendMessage);

// Send template
router.post('/send', sendTemplateMessage);

// Webhook Verification (Meta requirements)
router.get('/webhook', verifyWebhook);

// Webhook to receive WhatsApp replies
router.post('/webhook', handleWebhook);

// Get conversation by contactId
router.get('/:contactId', getConversation);

export default router;