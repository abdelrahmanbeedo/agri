import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Send, Package, DollarSign } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChatWindow({ conversation, currentUser, onMessageSent }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [conversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function fetchMessages() {
    try {
      const res = await axios.get(
        `${API_URL}/api/messages/conversation/${conversation._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setLoading(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/messages/conversation/${conversation._id}/message`,
        {
          content: newMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages([...messages, res.data]);
      setNewMessage("");
      onMessageSent?.();
      inputRef.current?.focus();
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  const getOtherParticipant = () => {
    if (conversation.participant1_id._id === currentUser.id) {
      return conversation.participant2_id;
    }
    return conversation.participant1_id;
  };

  const otherUser = getOtherParticipant();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-4 border-b border-sage-100 bg-sage-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sage-900">{otherUser.name}</h3>
            <p className="text-sm text-sage-500">{otherUser.email}</p>
          </div>
          {conversation.product_id && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-sage-600">Re: {conversation.product_id.title}</span>
              <span className="px-3 py-1 bg-honey-100 text-honey-700 rounded-lg font-medium">
                {conversation.product_id.price_per_unit} EGP/{conversation.product_id.unit}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-earth-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-sage-400" />
            </div>
            <p className="text-sage-500">No messages yet</p>
            <p className="text-sm text-sage-400">Start the conversation below</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id._id === currentUser.id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    isOwn
                      ? "bg-sage-600 text-white rounded-br-md"
                      : "bg-white border border-sage-100 text-sage-900 rounded-bl-md shadow-sm"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-sage-500 mb-1">
                      {message.sender_id.name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1.5 ${
                    isOwn ? "text-sage-200" : "text-sage-400"
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-sage-100 bg-white">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-sage-200 rounded-xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
