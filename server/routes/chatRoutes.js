import express from 'express';
import { processChatQuery } from '../controllers/chatController.js';

const router = express.Router();

router.post('/query', processChatQuery);

export default router;
