import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import ChatWindow from "../components/ChatWindow";
import { MessageCircle, Package, Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Messages() {
  const { t, isRTL } = useLanguage();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchConversations();
    fetchUnreadCount();
    const interval = setInterval(() => { fetchConversations(); fetchUnreadCount(); }, 30000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) setSelectedConversation(conv);
    }
  }, [searchParams, conversations]);

  async function fetchConversations() {
    try {
      const res = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchUnreadCount() {
    try {
      const res = await axios.get(`${API_URL}/api/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unread_count);
    } catch {}
  }

  const getOtherParticipant = (conv) =>
    conv.participant1_id._id === user.id ? conv.participant2_id : conv.participant1_id;

  const getUnreadCountForConversation = (conv) =>
    conv.participant1_id._id === user.id ? conv.unread_count_p1 : conv.unread_count_p2;

  const formatTime = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d;
    if (diff < 60000) return t('messages.justNow');
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return other.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-sage-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-sage-50/30 pt-16 md:pt-18 h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('messages.messages')}</h1>
          </div>
          {unreadCount > 0 && (
            <span className="badge badge-warning">{unreadCount} {t('messages.unread')}</span>
          )}
        </div>

        <div className="card overflow-hidden flex-1 flex min-h-0">
          <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} lg:w-[360px] flex-col border-r border-gray-100 flex-shrink-0`}>
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('messages.search')}
                  className="input pl-9 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">{t('messages.noConversations')}</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const unread = getUnreadCountForConversation(conv);
                  const isSelected = selectedConversation?._id === conv._id;
                  return (
                    <div key={conv._id} onClick={() => setSelectedConversation(conv)}
                      className={`px-4 py-3.5 border-b border-gray-50 cursor-pointer transition-all duration-150 ${
                        isSelected ? "bg-sage-50 border-l-2 border-l-sage-500" : "hover:bg-sage-50/50 border-l-2 border-l-transparent"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {other.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm truncate ${unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                                {other.name}
                              </p>
                              {conv.product_id && (
                                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                                  <Package className="w-3 h-3 shrink-0" />
                                  {conv.product_id.title}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs truncate mt-1.5 pl-10 ${unread > 0 ? "font-medium text-gray-700" : "text-gray-400"}`}>
                            {conv.last_message || t('messages.noMessagesYet')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] text-gray-400">{conv.last_message_at ? formatTime(conv.last_message_at) : ''}</span>
                          {unread > 0 && (
                            <span className="w-2 h-2 rounded-full bg-sage-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={`flex-1 flex flex-col min-h-0 ${selectedConversation ? '' : 'hidden lg:flex'}`}>
            {selectedConversation ? (
              <ChatWindow conversation={selectedConversation} currentUser={user}
                onMessageSent={() => { fetchConversations(); fetchUnreadCount(); }} />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('messages.selectConversation')}</h3>
                  <p className="text-gray-500 text-sm">{t('messages.selectConversationDesc')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
