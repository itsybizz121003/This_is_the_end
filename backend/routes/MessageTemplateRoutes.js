import express from 'express';
import { 
  addTemplate, getTemplates, updateTemplate, deleteTemplate 
} from '../controllers/MessageTemplateController.js';

const router = express.Router();

router.post('/', addTemplate);
router.get('/', getTemplates);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;