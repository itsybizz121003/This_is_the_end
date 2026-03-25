import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

export const getContacts = () => API.get('/contacts');
export const addContact = (data) => API.post('/contacts', data);
export const deleteContact = (id) => API.delete(`/contacts/${id}`);

export default API;
