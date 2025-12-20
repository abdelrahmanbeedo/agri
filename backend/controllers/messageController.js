import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

// Get or create conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ msg: "Cannot create conversation with yourself" });
    }

    // Check if other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Find existing conversation (order doesn't matter)
    let conversation = await Conversation.findOne({
      $or: [
        { participant1_id: currentUserId, participant2_id: userId },
        { participant1_id: userId, participant2_id: currentUserId }
      ]
    }).populate("participant1_id", "name email")
      .populate("participant2_id", "name email")
      .populate("product_id", "title price_per_unit");

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participant1_id: currentUserId,
        participant2_id: userId,
        product_id: req.body.product_id || null,
      });
      await conversation.save();
      await conversation.populate("participant1_id", "name email");
      await conversation.populate("participant2_id", "name email");
      if (conversation.product_id) {
        await conversation.populate("product_id", "title price_per_unit");
      }
    }

    res.json(conversation);
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [
        { participant1_id: userId },
        { participant2_id: userId }
      ]
    })
      .populate("participant1_id", "name email role")
      .populate("participant2_id", "name email role")
      .populate("product_id", "title price_per_unit images")
      .sort({ last_message_at: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    if (conversation.participant1_id.toString() !== userId && 
        conversation.participant2_id.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .populate("sender_id", "name email")
      .populate("receiver_id", "name email")
      .sort({ created_at: 1 });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation_id: conversationId,
        receiver_id: userId,
        is_read: false
      },
      { is_read: true }
    );

    // Update unread count
    if (conversation.participant1_id.toString() === userId) {
      conversation.unread_count_p1 = 0;
    } else {
      conversation.unread_count_p2 = 0;
    }
    await conversation.save();

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, receiver_id } = req.body;
    const senderId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ msg: "Message content is required" });
    }

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    if (conversation.participant1_id.toString() !== senderId && 
        conversation.participant2_id.toString() !== senderId) {
      return res.status(403).json({ msg: "Not authorized to send message in this conversation" });
    }

    // Determine receiver
    const receiverId = receiver_id || 
      (conversation.participant1_id.toString() === senderId 
        ? conversation.participant2_id 
        : conversation.participant1_id);

    // Create message
    const message = new Message({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
    });

    await message.save();
    await message.populate("sender_id", "name email");
    await message.populate("receiver_id", "name email");

    // Update conversation
    conversation.last_message = content.trim();
    conversation.last_message_at = new Date();
    conversation.updated_at = new Date();

    // Update unread count
    if (conversation.participant1_id.toString() === receiverId.toString()) {
      conversation.unread_count_p1 += 1;
    } else {
      conversation.unread_count_p2 += 1;
    }

    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [
        { participant1_id: userId },
        { participant2_id: userId }
      ]
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      if (conv.participant1_id.toString() === userId) {
        totalUnread += conv.unread_count_p1;
      } else {
        totalUnread += conv.unread_count_p2;
      }
    });

    res.json({ unread_count: totalUnread });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

