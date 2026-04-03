import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";
import { MessageCircle, Package } from "lucide-react";

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
    
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [token, navigate]);

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

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-earth-50 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-sage-900 mb-6">Messages</h1>

          <div className="bg-white rounded-2xl border border-sage-100 shadow-soft overflow-hidden h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              <div className={`${selectedConversation ? 'hidden lg:block' : ''} border-r border-sage-100 flex flex-col`}>
                <div className="px-5 py-4 border-b border-sage-100 flex items-center justify-between">
                  <h2 className="font-semibold text-sage-900">Conversations</h2>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-1 text-xs font-medium bg-sage-100 text-sage-700 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6 text-sage-400" />
                      </div>
                      <p className="text-sage-500">No conversations</p>
                      <p className="text-sm text-sage-400 mt-1">Start chatting from a product page</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const otherUser = getOtherParticipant(conv);
                      const unread = getUnreadCountForConversation(conv);
                      const isSelected = selectedConversation?._id === conv._id;
                      
                      return (
                        <div
                          key={conv._id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`px-5 py-4 border-b border-sage-50 cursor-pointer transition-colors ${
                            isSelected 
                              ? "bg-sage-50" 
                              : "hover:bg-sage-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`font-medium truncate ${
                                  unread > 0 ? "text-sage-900" : "text-sage-700"
                                }`}>
                                  {otherUser.name}
                                </p>
                                {unread > 0 && (
                                  <span className="w-2 h-2 bg-sage-500 rounded-full shrink-0" />
                                )}
                              </div>
                              {conv.product_id && (
                                <p className="text-xs text-sage-500 truncate flex items-center gap-1 mt-0.5">
                                  <Package className="w-3 h-3" />
                                  {conv.product_id.title}
                                </p>
                              )}
                              <p className="text-sm text-sage-500 truncate mt-1">
                                {conv.last_message || "No messages yet"}
                              </p>
                            </div>
                            <span className="text-xs text-sage-400 shrink-0">
                              {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className={`${selectedConversation ? '' : 'hidden lg:block'} lg:col-span-2 flex flex-col`}>
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
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div>
                      <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-sage-400" />
                      </div>
                      <h3 className="text-lg font-medium text-sage-900 mb-2">Select a conversation</h3>
                      <p className="text-sage-500">Choose from your existing conversations or start a new one from a product page</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
