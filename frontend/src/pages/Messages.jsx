import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Messages() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchConversations();
    fetchUnreadCount();
    
    // Refresh conversations every 30 seconds
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [token, navigate]);

  // Handle conversation selection from URL
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  async function fetchConversations() {
    try {
      const res = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await axios.get(`${API_URL}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Fetch unread count error:", err);
    }
  }

  const getOtherParticipant = (conversation) => {
    if (conversation.participant1_id._id === user.id) {
      return conversation.participant2_id;
    }
    return conversation.participant1_id;
  };

  const getUnreadCountForConversation = (conversation) => {
    if (conversation.participant1_id._id === user.id) {
      return conversation.unread_count_p1;
    }
    return conversation.unread_count_p2;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">
                  Conversations {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Start a conversation from a product page</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const otherUser = getOtherParticipant(conv);
                    const unread = getUnreadCountForConversation(conv);
                    
                    return (
                      <div
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                          selectedConversation?._id === conv._id ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {otherUser.name}
                            </p>
                            {conv.product_id && (
                              <p className="text-xs text-gray-500 truncate">
                                Re: {conv.product_id.title}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conv.last_message || "No messages yet"}
                            </p>
                          </div>
                          <div className="ml-2 flex flex-col items-end">
                            {unread > 0 && (
                              <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full mb-1">
                                {unread}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(conv.last_message_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  currentUser={user}
                  onMessageSent={() => {
                    fetchConversations();
                    fetchUnreadCount();
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

