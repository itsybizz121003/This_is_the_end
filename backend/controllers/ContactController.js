import Contact from '../models/ContactModel.js';
import Message from '../models/MessageModel.js';

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
    const contacts = await Contact.find();
    
    // For each contact, find the last message
    const contactsWithLastMessage = await Promise.all(contacts.map(async (contact) => {
      const lastMessage = await Message.findOne({ contact: contact._id })
        .sort({ timestamp: -1 });
      
      return {
        ...contact.toObject(),
        lastMessage: lastMessage ? {
          body: lastMessage.body,
          timestamp: lastMessage.timestamp
        } : null
      };
    }));

    // Sort by last message timestamp (latest first)
    contactsWithLastMessage.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp) : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp) : 0;
      return timeB - timeA;
    });

    res.status(200).json(contactsWithLastMessage);
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