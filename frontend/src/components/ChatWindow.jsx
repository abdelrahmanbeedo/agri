import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChatWindow({ conversation, currentUser, onMessageSent }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      
      // Poll for new messages every 5 seconds
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
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message. Please try again.");
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            <p className="text-sm text-gray-500">{otherUser.email}</p>
            {conversation.product_id && (
              <p className="text-xs text-gray-400 mt-1">
                About: {conversation.product_id.title}
              </p>
            )}
          </div>
          {conversation.product_id && (
            <div className="text-right">
              <p className="text-sm font-semibold text-green-600">
                {conversation.product_id.price_per_unit} EGP/{conversation.product_id.unit}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.sender_id.name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-green-100" : "text-gray-400"
                    }`}
                  >
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

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

