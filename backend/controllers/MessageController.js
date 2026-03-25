import Message from '../models/Message.js';
import Contact from '../models/Contact.js';
import MessageTemplate from '../models/MessageTemplate.js';
import axios from 'axios'; // for WhatsApp API calls

// WhatsApp API credentials
const WHATSAPP_API_URL = process.env.WHATSAPP_BASE_URL;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;


export const sendTemplateMessage = async (req, res) => {
  try {
    const { contactId, templateName } = req.body;

    // Fetch contact
    const contact = await Contact.findById(contactId);
    if (!contact || !contact.optIn)
      return res.status(400).json({ message: 'Contact not found or not opted-in' });

    // Fetch template
    const template = await MessageTemplate.findOne({ name: templateName, approved: true });
    if (!template) return res.status(400).json({ message: 'Template not found or not approved' });

    // WhatsApp API payload
    const payload = {
      messaging_product: 'whatsapp',
      to: contact.phone,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: contact.name } // simple placeholder replacement
            ],
          },
        ],
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
      body: template.body,
      direction: 'outgoing',
      status: 'sent',
    });
    await message.save();

    res.status(200).json({ message: 'Template sent', whatsappResponse: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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