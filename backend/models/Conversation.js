import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participant1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  participant2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Product this conversation is about (optional)
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  
  last_message: {
    type: String,
    default: "",
  },
  
  last_message_at: {
    type: Date,
    default: Date.now,
  },
  
  // Unread count for each participant
  unread_count_p1: {
    type: Number,
    default: 0,
  },
  
  unread_count_p2: {
    type: Number,
    default: 0,
  },
  
  created_at: {
    type: Date,
    default: Date.now,
  },
  
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one conversation per pair of users
conversationSchema.index({ participant1_id: 1, participant2_id: 1 }, { unique: true });
conversationSchema.index({ product_id: 1 });

export default mongoose.model("Conversation", conversationSchema);

