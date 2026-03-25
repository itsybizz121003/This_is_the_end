import Message from '../models/MessageModel.js';
import Contact from '../models/ContactModel.js';
import MessageTemplate from '../models/ManageTemplateModel.js';
import axios from 'axios'; // for WhatsApp API calls

// WhatsApp API credentials
const WHATSAPP_BASE_URL = process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Construct full messages URL
let WHATSAPP_API_URL = '';

if (WHATSAPP_BASE_URL.includes('/messages')) {
  WHATSAPP_API_URL = WHATSAPP_BASE_URL;
} else if (WHATSAPP_PHONE_NUMBER_ID) {
  WHATSAPP_API_URL = `${WHATSAPP_BASE_URL.replace(/\/$/, '')}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
} else {
  // Fallback if user put everything in the base URL
  WHATSAPP_API_URL = `${WHATSAPP_BASE_URL.replace(/\/$/, '')}/messages`;
}

console.log('Using WhatsApp API URL:', WHATSAPP_API_URL);


export const sendTemplateMessage = async (req, res) => {
  try {
    const { contactIds, templateName } = req.body;
    
    // Ensure contactIds is an array even if a single ID is sent
    const ids = Array.isArray(contactIds) ? contactIds : [contactIds];

    if (!ids || ids.length === 0 || !ids[0]) {
      return res.status(400).json({ message: 'No contacts selected for broadcast' });
    }

    console.log(ids)

    // Fetch template
    const template = await MessageTemplate.findOne({ name: templateName });
    if (!template) return res.status(400).json({ message: 'Template not found' });

    const results = [];
    const errors = [];

    // Fetch all contacts at once for efficiency
    const contacts = await Contact.find({ _id: { $in: ids } });

    // Loop through contacts and send
    for (const contactId of ids) {
      try {
        const contact = contacts.find(c => c._id.toString() === contactId.toString());
        
        if (!contact) {
          errors.push({ contactId, error: 'Contact not found' });
          continue;
        }

        let phoneNumber = contact.phone.replace(/\D/g, '');
        if (phoneNumber.length === 10 && !phoneNumber.startsWith('91')) {
          phoneNumber = `91${phoneNumber}`;
        }

        const payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNumber,
          type: "template",
          template: {
            name: templateName,
            language: {
              code:"en_US",
            },
          },
        };

        // Send via WhatsApp API
        const response = await axios.post(WHATSAPP_API_URL, payload, {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        // Log message in DB
        const message = new Message({
          contact: contact._id,
          type: 'template',
          body: `Template: ${templateName}`,
          direction: 'outgoing',
          status: 'sent',
          whatsappMessageId: response.data.messages[0].id
        });
        await message.save();
        
        results.push({ contactId, status: 'success', messageId: response.data.messages[0].id });
      } catch (err) {
        const errorDetail = err.response?.data || err.message;
        console.error(`Error sending to ${contactId}:`, errorDetail);
        errors.push({ contactId, error: errorDetail });
      }
    }

    res.status(200).json({ 
      message: 'Broadcast completed', 
      totalSent: results.length, 
      totalFailed: errors.length,
      results,
      errors 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during broadcast' });
  }
};

export const logIncomingMessage = async (req, res) => {
  try {
    const { from, text } = req.body; // adjust depending on WhatsApp webhook payload

    // Find contact
    const contact = await Contact.findOne({ phone: from });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    const message = new Message({
      contact: contact._id,
      type: 'text',
      body: text,
      direction: 'incoming',
      status: 'received',
    });
    await message.save();

    res.status(200).json({ message: 'Incoming message logged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { contactId } = req.params;

    const messages = await Message.find({ contact: contactId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};