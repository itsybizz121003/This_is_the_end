import React, { useState, useEffect } from 'react';
import { getContacts, addContact, deleteContact, updateContact } from '../services/api';
import { Users, Plus, Trash2, Search, Edit2, X } from 'lucide-react';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [editingContact, setEditingContact] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data } = await getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await addContact(newContact);
      setShowAddModal(false);
      setNewContact({ name: '', phone: '' });
      fetchContacts();
    } catch (err) {
      console.error('Error adding contact:', err);
      alert('Contact add karne mein error aaya.');
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact({ ...contact });
    setShowEditModal(true);
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      await updateContact(editingContact._id, {
        name: editingContact.name,
        phone: editingContact.phone
      });
      setShowEditModal(false);
      setEditingContact(null);
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
      alert('Contact update karne mein error aaya.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Kya aap is contact ko delete karna chahte hain?')) {
      try {
        await deleteContact(id);
        fetchContacts();
      } catch (err) {
        console.error('Error deleting contact:', err);
      }
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Contacts Management</h2>
          <p className="text-slate-400 text-sm mt-1">Apne contacts ko yahan manage karein.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <Plus size={18} />
          Add New Contact
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or phone..."
            className="w-full bg-[#0d0d2b] border border-indigo-500/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-slate-400 text-sm">Total Contacts</span>
          <span className="text-xl font-bold text-indigo-400">{contacts.length}</span>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-[#0d0d2b] rounded-2xl border border-indigo-500/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-500/10 bg-white/5">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center text-indigo-400 font-bold">
                          {contact.name?.[0] || 'U'}
                        </div>
                        <span className="font-medium text-slate-200">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                      {contact.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditContact(contact)}
                          className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(contact._id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0d0d2b] border border-indigo-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-indigo-500/10 flex items-center justify-between">
              <h3 className="font-bold text-lg">Add New Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  className="w-full bg-white/5 border border-indigo-500/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500/30 transition-all"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number (with country code)</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. +919876543210"
                  className="w-full bg-white/5 border border-indigo-500/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500/30 transition-all font-mono"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0d0d2b] border border-indigo-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-indigo-500/10 flex items-center justify-between">
              <h3 className="font-bold text-lg">Edit Contact</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateContact} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  className="w-full bg-white/5 border border-indigo-500/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500/30 transition-all text-white"
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. +919876543210"
                  className="w-full bg-white/5 border border-indigo-500/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500/30 transition-all text-white font-mono"
                  value={editingContact.phone}
                  onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
                >
                  Update Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
