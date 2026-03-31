import express from 'express';
import { 
  addTemplate, getTemplates, updateTemplate, deleteTemplate,
  getMetaTemplates, createMetaTemplate
} from '../controllers/MessageTemplateController.js';

const router = express.Router();

// Local Database Routes
router.post('/', addTemplate);
router.get('/', getTemplates);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

// Meta API Routes
router.get('/get-templates', getMetaTemplates);
router.post('/create-template', createMetaTemplate);

export default router;