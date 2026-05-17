import express from 'express';
import {
  getMessages,
  sendMessage,
  getLawyersForChat
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/lawyers-list', getLawyersForChat);
router.get('/:senderId/:receiverId', getMessages);
router.post('/', sendMessage);

export default router;