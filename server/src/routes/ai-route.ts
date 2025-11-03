import express from 'express';
import {
  projectAssistantChat,
  projectAssistantChatStream,
  researchAssistantChat,
  researchAssistantChatSimple,
} from '../controllers/ai-controllers';
import { verifyJWT } from '../middleware/auth-middleware';

const router = express.Router();

// Research Assistant Routes
router.post('/research-assistant/chat', verifyJWT, researchAssistantChatSimple);
router.post(
  '/research-assistant/chat-stream',
  verifyJWT,
  researchAssistantChat
);

// Project Assistant Routes
router.post('/project-assistant/chat', verifyJWT, projectAssistantChat);
router.post(
  '/project-assistant/chat-stream',
  verifyJWT,
  projectAssistantChatStream
);

export default router;
