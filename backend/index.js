import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import contactRoutes from './routes/ContactRoutes.js';
import messageTemplateRoutes from './routes/MessageTemplateRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';
import { getMetaTemplates, createMetaTemplate } from './controllers/MessageTemplateController.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust this in production
    methods: ['GET', 'POST'],
  },
});

// Connect MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io to be used in controllers
export { io };

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', messageTemplateRoutes);
app.use('/api/messages', messageRoutes);

// Direct Meta API Routes (for frontend compatibility)
app.get('/api/get-templates', getMetaTemplates);
app.post('/api/create-template', createMetaTemplate);

// console.log('--- Routes Configured ---');
// console.log('Webhook GET (Verification): http://localhost:5000/api/messages/webhook');
// console.log('Webhook POST (Incoming):    http://localhost:5000/api/messages/webhook');

app.get('/', (req, res) => res.send('WhatsApp Automation Backend Running'));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));