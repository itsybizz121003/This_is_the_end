import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import contactRoutes from './routes/ContactRoutes.js';
import messageTemplateRoutes from './routes/MessageTemplateRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', messageTemplateRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => res.send('WhatsApp Automation Backend Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));