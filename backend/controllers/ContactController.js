import Contact from '../models/ContactModel.js';

export const addContact = async (req, res) => {
  try {
    const { name, phone, source = 'manual', optIn = false } = req.body;

    // Check if contact already exists
    let existing = await Contact.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Contact already exists' });

    const contact = new Contact({ name, phone, source, optIn });
    await contact.save();

    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g., { name, phone, optIn }

    const updated = await Contact.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Contact not found' });

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Contact not found' });

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};