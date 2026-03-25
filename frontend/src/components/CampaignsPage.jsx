import React, { useState, useEffect } from 'react';
import { getContacts, getTemplates, sendBroadcast } from '../services/api';
import { Send, Users, FileText, CheckCircle2, AlertCircle, Loader2, Search } from 'lucide-react';

const CampaignsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignStats, setCampaignStats] = useState({
  totalSent: 0,
  totalFailed: 0,
});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contactsRes, templatesRes] = await Promise.all([
          getContacts(),
          getTemplates()
        ]);
        setContacts(contactsRes.data);
        setTemplates(templatesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c._id));
    }
  };

  const handleToggleContact = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSendBroadcast = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) {
      alert('Please select a template and at least one contact.');
      return;
    }

    try {
      setSending(true);
      setStatus(null);
      const res = await sendBroadcast({
        contactIds: selectedContacts,
        templateName: selectedTemplate
      });
      
      if (res.data.totalSent > 0) {
        setStatus({
          success: true,
          message: `Campaign successful! Sent to ${res.data.totalSent} contacts.`,
          details: res.data
        });
        setCampaignStats(prev => ({
  totalSent: prev.totalSent + res.data.totalSent,
  totalFailed: prev.totalFailed + res.data.totalFailed
}));
localStorage.setItem("campaignStats", JSON.stringify({
  totalSent: res.data.totalSent,
  totalFailed: res.data.totalFailed
}));
        setSelectedContacts([]);
        setSelectedTemplate('');
      } else {
        setStatus({
          success: false,
          message: `Campaign unsuccessful! 0 contacts were reached.`,
          details: res.data
        });
      }
    } catch (err) {
      console.error('Broadcast error:', err);
      setStatus({
        success: false,
        message: err.response?.data?.message || 'Failed to send broadcast campaign.'
      });
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400">Loading campaign data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Send className="text-indigo-500" />
          Create Broadcast Campaign
        </h2>
        <p className="text-slate-400 mt-1">Ek saath sabhi ya select kiye gaye contacts ko message bhejein.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Select Template */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0d0d2b] border border-indigo-500/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <FileText size={16} />
              1. Select Template
            </h3>
            <div className="space-y-3">
              {templates.length === 0 ? (
                <p className="text-xs text-amber-400 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
                  Koi templates nahi mile. Pehle Meta se sync karein.
                </p>
              ) : (
                templates.map(t => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTemplate(t.name)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate === t.name ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                  >
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-[10px] mt-1 opacity-60 uppercase">{t.category} • {t.language}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Campaign Summary & Action */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold mb-4">Campaign Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Selected Contacts:</span>
                <span className="font-bold">{selectedContacts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Template:</span>
                <span className="font-bold truncate max-w-[150px]">{selectedTemplate || 'None'}</span>
              </div>
            </div>
            <button
              disabled={sending || !selectedTemplate || selectedContacts.length === 0}
              onClick={handleSendBroadcast}
              className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={18} />
              )}
              {sending ? 'Sending Broadcast...' : 'Launch Campaign'}
            </button>
          </div>

          {status && (
            <div className={`p-4 rounded-2xl border ${status.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <div className="flex items-start gap-3">
                {status.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <div>
                  <p className="text-sm font-bold">{status.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Select Contacts */}
        <div className="lg:col-span-2">
          <div className="bg-[#0d0d2b] border border-indigo-500/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Users size={16} />
                2. Select Recipients
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text"
                    placeholder="Search contacts..."
                    className="bg-white/5 border border-indigo-500/10 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-white/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <div className="w-4 h-4 rounded border border-indigo-500/30 flex items-center justify-center cursor-pointer" onClick={handleSelectAll}>
                        {selectedContacts.length === contacts.length && <div className="w-2 h-2 bg-indigo-500 rounded-sm" />}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-500/5">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-500 text-sm">No contacts found.</td>
                    </tr>
                  ) : (
                    filteredContacts.map(contact => (
                      <tr 
                        key={contact._id} 
                        className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedContacts.includes(contact._id) ? 'bg-indigo-500/5' : ''}`}
                        onClick={() => handleToggleContact(contact._id)}
                      >
                        <td className="px-6 py-4">
                          <div className={`w-4 h-4 rounded border transition-all ${selectedContacts.includes(contact._id) ? 'bg-indigo-500 border-indigo-500' : 'border-indigo-500/30'}`}>
                            {selectedContacts.includes(contact._id) && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 font-bold text-xs">
                              {contact.name?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-medium text-slate-200">{contact.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">{contact.phone}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
