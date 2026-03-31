import React, { useState } from 'react';
import { X, Send, MessageSquare, FileText, Globe, Tag } from 'lucide-react';
import { createTemplate } from '../services/api';

const CreateTemplateForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en_US',
    body: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'UTILITY', label: 'Utility', desc: 'Order updates, appointment reminders' },
    { value: 'MARKETING', label: 'Marketing', desc: 'Promotions, offers, announcements' },
    { value: 'AUTHENTICATION', label: 'Authentication', desc: 'OTP, verification codes' }
  ];

  const languages = [
    { code: 'en_US', name: 'English (US)' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createTemplate(formData);
      onSuccess?.(response.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d2b] border border-indigo-500/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d2b] border-b border-indigo-500/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create WhatsApp Template</h2>
              <p className="text-slate-400 text-sm">Design your message template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <FileText size={16} className="text-indigo-400" />
              Template Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., order_update, welcome_message"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-[#07071a] border border-indigo-500/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Use lowercase letters and underscores only</p>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Tag size={16} className="text-indigo-400" />
              Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className={`relative cursor-pointer rounded-xl border p-3 transition-all ${
                    formData.category === cat.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-indigo-500/10 bg-[#07071a] hover:border-indigo-500/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={formData.category === cat.value}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium text-white">{cat.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{cat.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Globe size={16} className="text-indigo-400" />
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full bg-[#07071a] border border-indigo-500/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message Body */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <MessageSquare size={16} className="text-indigo-400" />
              Message Body
            </label>
            <textarea
              required
              rows={4}
              placeholder="Hello {{1}}, your order is confirmed!"
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              className="w-full bg-[#07071a] border border-indigo-500/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all resize-none"
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-slate-500">
                Use {'{{1}}'}, {'{{2}}'}, etc. for dynamic variables
              </p>
              <p className="text-xs text-slate-500">
                Character limit: {formData.body.length}/1024
              </p>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Preview</label>
            <div className="bg-white/5 border border-indigo-500/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-2xl rounded-tl-none p-3 text-sm text-slate-800">
                    {formData.body || 'Your message will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-indigo-500/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#07071a] border border-indigo-500/10 text-white rounded-xl hover:bg-[#0a0a1a] transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.body}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Create Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateForm;
