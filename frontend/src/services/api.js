import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Contact APIs
export const getContacts = () => API.get('/contacts');
export const addContact = (data) => API.post('/contacts', data);
export const updateContact = (id, data) => API.put(`/contacts/${id}`, data);
export const deleteContact = (id) => API.delete(`/contacts/${id}`);

// Message Template APIs
export const getTemplates = () => API.get('/templates');
export const addTemplate = (data) => API.post('/templates', data);
export const updateTemplate = (id, data) => API.put(`/templates/${id}`, data);
export const deleteTemplate = (id) => API.delete(`/templates/${id}`);

// Message APIs
export const sendBroadcast = (data) => API.post('/messages/send', data);
export const getConversation = (contactId) => API.get(`/messages/${contactId}`);
export const getMessages = () => API.get('/messages');
export const sendMessage = (data) => API.post('/messages/send-message', data);

export default API;
