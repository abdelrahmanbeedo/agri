import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} from "../controllers/messageController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get or create conversation with a user
router.post("/conversation/:userId", getOrCreateConversation);

// Get all conversations for current user
router.get("/conversations", getConversations);

// Get messages for a conversation
router.get("/conversation/:conversationId/messages", getMessages);

// Send a message
router.post("/conversation/:conversationId/message", sendMessage);

// Get unread message count
router.get("/unread-count", getUnreadCount);

export default router;

