import React, { useState, useEffect } from 'react';
import { getTemplates, addTemplate, deleteTemplate } from '../services/api';
import { FileText, Plus, Trash2, Search, MessageSquare, Zap, Clock } from 'lucide-react';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', category: 'UTILITY', language: 'en_US', components: [] });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Kya aap is template ko delete karna chahte hain?')) {
      try {
        await deleteTemplate(id);
        fetchTemplates();
      } catch (err) {
        console.error('Error deleting template:', err);
      }
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Message Templates</h2>
          <p className="text-slate-400 text-sm mt-1">WhatsApp templates yahan se manage karein.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <Plus size={18} />
          Sync from Meta
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by template name or category..."
            className="w-full bg-[#0d0d2b] border border-indigo-500/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-slate-400 text-sm">Active Templates</span>
          <span className="text-xl font-bold text-indigo-400">{templates.length}</span>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Templates fetch ho rahe hain...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-[#0d0d2b] rounded-2xl border border-indigo-500/10 p-12 text-center text-slate-500">
          No templates found. Sync from Meta to get your templates.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="bg-[#0d0d2b] border border-indigo-500/10 rounded-2xl p-6 group hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileText size={20} className="text-white" />
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${template.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                    {template.status || 'APPROVED'}
                  </span>
                  <button 
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <h3 className="font-bold text-slate-100 mb-1 truncate">{template.name}</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Zap size={10} className="text-indigo-400" />
                {template.category} • {template.language}
              </p>

              {/* Preview Box */}
              <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs text-slate-400 leading-relaxed min-h-[80px]">
                {template.components?.find(c => c.type === 'BODY')?.text || "No body content available."}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-indigo-500/5 mt-auto">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock size={12} />
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </div>
                {/* <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  View Full Details
                </button> */}
              </div>

              {/* Glow Effect */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
