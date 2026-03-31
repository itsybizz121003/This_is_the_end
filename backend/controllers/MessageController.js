import Message from '../models/MessageModel.js';
import Contact from '../models/ContactModel.js';
import MessageTemplate from '../models/ManageTemplateModel.js';
import axios from 'axios'; // for WhatsApp API calls
import { io } from '../index.js';

// WhatsApp API credentials
const WHATSAPP_BASE_URL = process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

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

// Webhook Verification (GET /webhook)
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('--- Webhook Verification ---');
  console.log('Mode:', mode);
  console.log('Token received:', token);
  console.log('Challenge:', challenge);
  console.log('Expected Token (VERIFY_TOKEN):', VERIFY_TOKEN);

  // Test fallback if no query params
  if (!mode && !token && !challenge) {
    return res.status(200).send('Webhook working. Full URL should be: /api/messages/webhook');
  }

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  } else {
    console.error('WEBHOOK_VERIFICATION_FAILED: Token mismatch or invalid mode');
    return res.sendStatus(403);
  }
};

// Handle Incoming Messages (POST /webhook)
export const handleWebhook = async (req, res) => {
  try {
    const { body } = req;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const messageData = body.entry[0].changes[0].value.messages[0];
        const from = messageData.from; // Sender's phone number
        const text = messageData.text?.body || '';
        const whatsappMessageId = messageData.id;

        // Find or Create Contact
        let contact = await Contact.findOne({ phone: from });
        if (!contact) {
          // If contact doesn't exist, create it (optional based on requirements)
          contact = new Contact({ 
            name: from, // Use phone number as default name
            phone: from 
          });
          await contact.save();
        }

        const message = new Message({
          contact: contact._id,
          type: 'text',
          body: text,
          direction: 'incoming',
          status: 'received',
          whatsappMessageId: whatsappMessageId,
          timestamp: new Date()
        });

        await message.save();

        // Emit message via Socket.IO
        io.emit('new_message', {
          ...message.toObject(),
          contactName: contact.name,
          contactPhone: contact.phone
        });

        console.log(`Received message from ${from}: ${text}`);
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('Webhook Error:', err);
    res.sendStatus(500);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { contactId, text } = req.body;
 console.log("heyy")
    const contact = await Contact.findById(contactId);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    let phoneNumber = contact.phone.replace(/\D/g, '');
    if (phoneNumber.length === 10 && !phoneNumber.startsWith('91')) {
      phoneNumber = `91${phoneNumber}`;
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "text",
      text: { body: text },
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
     console.log("response", response.data)
    const message = new Message({
      contact: contact._id,
      type: 'text',
      body: text,
      direction: 'outgoing',
      status: 'sent',
      whatsappMessageId: response.data.messages[0].id,
      timestamp: new Date()
    });

    await message.save();

    // Emit message via Socket.IO
    io.emit('new_message', {
      ...message.toObject(),
      contactName: contact.name,
      contactPhone: contact.phone
    });

    res.status(200).json(message);
  } catch (err) {
    const errorDetail = err.response?.data || err.message;
    console.error('Error sending message:', errorDetail);
    res.status(500).json({ message: 'Error sending message', error: errorDetail });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('contact', 'name phone')
      .sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendTemplateMessage = async (req, res) => {
  try {
    const { contactIds, templateName } = req.body;
    
    // Ensure contactIds is an array even if a single ID is sent
    const ids = Array.isArray(contactIds) ? contactIds : [contactIds];

    if (!ids || ids.length === 0 || !ids[0]) {
      return res.status(400).json({ message: 'No contacts selected for broadcast' });
    }

    // Fetch template from Meta API instead of local database
    const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "YOUR_WABA_ID";
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN";
    
    let template;
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        }
      );
      
      template = response.data.data?.find(t => t.name === templateName);
      console.log("Template from Meta API:", template);
    } catch (error) {
      console.error("Error fetching template from Meta API:", error);
    }
    
    if (!template) return res.status(400).json({ message: 'Template not found in Meta API' });
    const results = [];
    const errors = [];

    // Fetch all contacts at once for efficiency
    const contacts = await Contact.find({ _id: { $in: ids } });
  console.log("Contacts:",contacts);
    // Loop through contacts and send
    for (const contactId of ids) {
      let contact = null;
      let phoneNumber = null;
      
      try {
        contact = contacts.find(c => c._id.toString() === contactId.toString());
        
        if (!contact) {
          console.log(`Contact not found for ID: ${contactId}`);
          errors.push({ contactId, contactName: 'Unknown', phoneNumber: 'Unknown', error: 'Contact not found' });
          continue;
        }

        phoneNumber = contact.phone.replace(/\D/g, '');
        
        // Fix phone number formatting for India
        if (phoneNumber.length === 10) {
          phoneNumber = `91${phoneNumber}`;
        } else if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) {
          // Already in correct format
        } else if (phoneNumber.length === 11 && phoneNumber.startsWith('0')) {
          // Remove leading 0 and add 91
          phoneNumber = `91${phoneNumber.substring(1)}`;
        }

        console.log(`Sending to ${contact.name} (${contact.phone}) -> formatted: ${phoneNumber}`);

        const payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNumber,
          type: "template",
          template: {
            name: templateName,
            language: {
              code: template.language || "en_US",
            },
          },
        };

        console.log("Template payload:", JSON.stringify(payload, null, 2));

        // Send via WhatsApp API
        const response = await axios.post(WHATSAPP_API_URL, payload, {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log("WhatsApp API Response:", response.data);
        
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
        
        results.push({ contactId, contactName: contact.name, phoneNumber, status: 'success', messageId: response.data.messages[0].id });
      } catch (err) {
        const errorDetail = err.response?.data || err.message;
        console.error(`Error sending to ${contactId} (${contact?.name || 'Unknown'}):`, errorDetail);
        
        // Handle specific WhatsApp API errors
        let errorMessage = errorDetail;
        if (errorDetail.error) {
          switch (errorDetail.error.code) {
            case 135000:
              errorMessage = `Generic user error - Check WhatsApp Business API setup and phone number ID`;
              break;
            case 131048:
              errorMessage = `Template not found or not approved`;
              break;
            case 131051:
              errorMessage = `Phone number not connected to WhatsApp Business`;
              break;
            default:
              errorMessage = `WhatsApp API Error: ${errorDetail.error.message}`;
          }
        }
        
        errors.push({ 
          contactId, 
          contactName: contact?.name || 'Unknown', 
          phoneNumber: phoneNumber || 'Unknown', 
          error: errorMessage,
          originalError: errorDetail 
        });
      }
    }

    console.log(`\n=== BROADCAST SUMMARY ===`);
    console.log(`Total contacts processed: ${ids.length}`);
    console.log(`Successfully sent: ${results.length}`);
    console.log(`Failed: ${errors.length}`);
    console.log(`Results:`, results);
    console.log(`Errors:`, errors);
    console.log(`=========================\n`);

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

export const testWhatsAppConnection = async (req, res) => {
  try {
    console.log("=== WhatsApp Connection Test ===");
    console.log("API URL:", WHATSAPP_API_URL);
    console.log("Token exists:", !!WHATSAPP_TOKEN);
    console.log("Phone ID exists:", !!WHATSAPP_PHONE_NUMBER_ID);
    
    const testPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919910249332", // Test with your own number
      type: "text",
      text: { body: "Test message from WhatsApp API" }
    };

    console.log("Test payload:", JSON.stringify(testPayload, null, 2));

    const response = await axios.post(WHATSAPP_API_URL, testPayload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Test successful:", response.data);
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Test failed:", err.response?.data || err.message);
    res.status(500).json({ 
      success: false, 
      error: err.response?.data || err.message 
    });
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