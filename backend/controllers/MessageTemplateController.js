import MessageTemplate from '../models/MessageTemplate.js';


export const addTemplate = async (req, res) => {
  try {
    const { name, language = 'en', body, approved = false } = req.body;

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