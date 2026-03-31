import MessageTemplate from '../models/ManageTemplateModel.js';
import axios from 'axios';

// WhatsApp Business Account Configuration
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "YOUR_WABA_ID";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "YOUR_ACCESS_TOKEN";

console.log("WABA_ID:", WABA_ID);
console.log("ACCESS_TOKEN:", ACCESS_TOKEN);
export const addTemplate = async (req, res) => {
  try {
    const { name, language = 'en_US', body, approved = false } = req.body;

    const existing = await MessageTemplate.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Template already exists' });

    const template = new MessageTemplate({ name, language, body, approved });
    await template.save();

    res.status(201).json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await MessageTemplate.find().sort({ createdAt: -1 });
    res.status(200).json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// EDIT / UPDATE template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g., { body, approved }

    const updated = await MessageTemplate.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Template not found' });

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MessageTemplate.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Template not found' });

    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Templates from Meta API
export const getMetaTemplates = async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    res.json(response.data?.data);
  } catch (error) {
    console.error("Error fetching templates:", error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: error.message });
  }
};

// Create Template in Meta API
export const createMetaTemplate = async (req, res) => {
  const { name, category, language, body } = req.body;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates`,
      {
        name: name,
        category: category,
        language: language,
        components: [
          {
            type: "BODY",
            text: body,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data?.data);
  } catch (error) {
    console.error("Error creating template:", error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: error.message });
  }
};