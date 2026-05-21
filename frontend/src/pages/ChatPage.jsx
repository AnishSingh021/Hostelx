import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, Image, X, CheckCheck, Check, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '../config';

const ENDPOINT = BACKEND_URL;
const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];
let socket;

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [reactionMenu, setReactionMenu] = useState(null); // { msgId, x, y }
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedChatRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chats
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('https://hostelx-backend-a228.onrender.com/api/chats', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setChats(data);
    } catch (e) {}
  }, [user.token]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Socket setup
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    socket.on('message received', (newMsg) => {
      if (!selectedChatRef.current || selectedChatRef.current._id !== newMsg.chat._id) {
        fetchChats();
      } else {
        setMessages((prev) => [...prev, newMsg.latestMessage || newMsg]);
        fetchChats();
        // Mark as read
        markRead(selectedChatRef.current._id);
      }
    });

    return () => socket.disconnect();
  }, [fetchChats]);

  // Update selectedChatRef whenever selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Load messages when chat selected
  useEffect(() => {
    if (!selectedChat) return;
    setMessages(selectedChat.messages || []);
    socket.emit('join chat', selectedChat._id);
    markRead(selectedChat._id);
    scrollToBottom();
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const markRead = async (chatId) => {
    try {
      const res = await fetch(`https://hostelx-backend-a228.onrender.com/api/chats/${chatId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        socket.emit('messages read', { chatId, userId: user._id });
        // Re-fetch so the sidebar & Dashboard badge both reflect the cleared state
        fetchChats();
      }
    } catch (e) {}
  };

  // Click handler: optimistically clear unread badge, then persist via API
  const handleSelectChat = (chat) => {
    // Instantly zero-out the unread count in sidebar state (no waiting for API)
    setChats(prev =>
      prev.map(c =>
        c._id === chat._id
          ? { ...c, messages: (c.messages || []).map(m => ({ ...m, read: true })) }
          : c
      )
    );
    setSelectedChat(chat);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected || !selectedChat) return;
    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', selectedChat._id);
      setTyping(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !imageFile) || !selectedChat || sending) return;
    setSending(true);
    socket.emit('stop typing', selectedChat._id);

    try {
      let body;
      const headers = { Authorization: `Bearer ${user.token}` };

      if (imageFile) {
        // Image upload — use multipart/FormData (multer handles it)
        const formData = new FormData();
        formData.append('image', imageFile);
        body = formData;
        // Do NOT set Content-Type; browser sets it with the boundary automatically
      } else {
        // Text message — use plain JSON (express.json() handles it)
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ text: newMessage.trim() });
      }

      const res = await fetch(
        `https://hostelx-backend-a228.onrender.com/api/chats/${selectedChat._id}/messages`,
        { method: 'POST', headers, body }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error('Send failed:', err.message);
        return;
      }

      const updatedChat = await res.json();
      const latestMsg = updatedChat.messages?.[updatedChat.messages.length - 1];

      setMessages(updatedChat.messages || []);
      setNewMessage('');
      setImageFile(null);
      setImagePreview(null);

      // Broadcast via socket so receiver gets it in real-time
      if (latestMsg) {
        socket.emit('new message', { ...latestMsg, chat: updatedChat });
      }
      fetchChats();
    } catch (e) {
      console.error('Send error:', e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleReact = async (msgId, emoji) => {
    setReactionMenu(null);
    try {
      const res = await fetch(
        `https://hostelx-backend-a228.onrender.com/api/chats/${selectedChat._id}/messages/${msgId}/react`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ emoji }),
        }
      );
      const updatedChat = await res.json();
      setMessages(updatedChat.messages || []);
    } catch (e) {}
  };

  const getOtherUser = (participants) =>
    participants?.find((p) => p._id !== user._id);

  // Stable string comparison for sender IDs (handles ObjectId, string, or populated object)
  const toId = (v) => v?._id?.toString() || v?.toString() || String(v);

  const getUnreadInChat = (chat) =>
    chat.messages?.filter(
      (m) => !m.read && toId(m.sender) !== toId(user._id)
    ).length || 0;

  const isMine = (msg) => toId(msg.sender) === toId(user._id);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 rounded-full hover:bg-muted transition cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-xl text-primary">Messages</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT PANEL: Chat List ─── */}
        <aside className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-border bg-background`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg">Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No conversations yet. <br />Start a chat from a product page!
              </div>
            ) : (
              chats.map((chat) => {
                const other = getOtherUser(chat.participants);
                const lastMsg = chat.messages?.[chat.messages.length - 1];
                const unread = getUnreadInChat(chat);
                const isActive = selectedChat?._id === chat._id;

                return (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition border-b border-border/50 ${isActive ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={other?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                        alt={other?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-semibold text-sm truncate ${unread > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                          {other?.name}
                        </span>
                        {lastMsg && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {lastMsg ? (lastMsg.type === 'image' ? '📷 Photo' : lastMsg.text) : `About: ${chat.product?.title}`}
                        </p>
                        {unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-1">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ─── RIGHT PANEL: Chat Window ─── */}
        <main className={`${!selectedChat ? 'hidden md:flex md:flex-col md:items-center md:justify-center' : 'flex flex-col'} flex-1 overflow-hidden`}>
          {!selectedChat ? (
            <div className="text-center text-muted-foreground">
              <MessageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background z-10 flex-shrink-0">
                <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 rounded-full hover:bg-muted cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {selectedChat.product?.images?.[0] && (
                  <img src={selectedChat.product.images[0]} alt="product" className="w-10 h-10 rounded-lg object-cover border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">
                    {getOtherUser(selectedChat.participants)?.name}
                  </p>
                  <p className="text-xs text-primary truncate">{selectedChat.product?.title}</p>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-background/50"
                onClick={() => setReactionMenu(null)}
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const mine = isMine(msg);
                    const showAvatar = !mine && (idx === 0 || isMine(messages[idx - 1]));
                    const other = getOtherUser(selectedChat.participants);
                    const hasReactions = msg.reactions?.length > 0;
                    const grouped = idx > 0 && isMine(messages[idx - 1]) === mine;

                    return (
                      <motion.div
                        key={msg._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-3'}`}
                      >
                        {/* Avatar placeholder for alignment */}
                        {!mine && (
                          <div className="w-8 mr-2 flex-shrink-0 self-end">
                            {showAvatar && (
                              <img
                                src={other?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                                className="w-7 h-7 rounded-full object-cover"
                                alt=""
                              />
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'} max-w-[72%]`}>
                          {/* Bubble */}
                          <div
                            className="relative group"
                            onDoubleClick={() => setReactionMenu({ msgId: msg._id, mine })}
                          >
                            {msg.type === 'image' ? (
                              <img
                                src={msg.image}
                                alt="shared"
                                className={`max-w-xs rounded-2xl object-cover cursor-pointer ${mine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                              />
                            ) : (
                              <div
                                className={`px-4 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                                  mine
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                                }`}
                              >
                                {msg.text}
                              </div>
                            )}

                            {/* Quick React Button on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReactionMenu(reactionMenu?.msgId === msg._id ? null : { msgId: msg._id, mine });
                              }}
                              className={`absolute ${mine ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition px-1 cursor-pointer`}
                            >
                              <Smile className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>

                            {/* Reaction Picker */}
                            <AnimatePresence>
                              {reactionMenu?.msgId === msg._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className={`absolute ${mine ? 'right-0' : 'left-0'} -top-12 bg-card border border-border rounded-full px-2 py-1 flex gap-1 shadow-lg z-20`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {EMOJI_REACTIONS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReact(msg._id, emoji)}
                                      className="text-lg hover:scale-125 transition cursor-pointer"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Reactions display */}
                          {hasReactions && (
                            <div className={`flex gap-0.5 -mt-1 ${mine ? 'justify-end' : 'justify-start'} flex-wrap`}>
                              {Object.entries(
                                msg.reactions.reduce((acc, r) => {
                                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                  return acc;
                                }, {})
                              ).map(([emoji, count]) => (
                                <span key={emoji} className="bg-card border border-border rounded-full text-xs px-1.5 py-0.5 shadow-sm">
                                  {emoji}{count > 1 && ` ${count}`}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Timestamp + Read receipt */}
                          <div className={`flex items-center gap-1 mt-0.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {mine && (
                              msg.read
                                ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                                : <Check className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mt-2"
                    >
                      <img
                        src={getOtherUser(selectedChat.participants)?.profileImage}
                        className="w-6 h-6 rounded-full object-cover"
                        alt=""
                      />
                      <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-2 flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-3"
                  >
                    <img src={imagePreview} className="w-16 h-16 rounded-xl object-cover border border-border" alt="preview" />
                    <p className="text-sm text-muted-foreground flex-1">Ready to send</p>
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-destructive cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-border bg-background flex-shrink-0">
                <div className="flex items-end gap-2">
                  {/* Image picker */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer flex-shrink-0"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

                  {/* Text input */}
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Message..."
                    disabled={!!imageFile}
                    className="flex-1 bg-muted border-none rounded-2xl px-4 py-2.5 resize-none outline-none focus:ring-2 focus:ring-primary text-sm max-h-32 placeholder:text-muted-foreground disabled:opacity-50 transition"
                    style={{ minHeight: '42px' }}
                  />

                  {/* Send */}
                  <button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && !imageFile) || sending}
                    className="p-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-40 flex-shrink-0 cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Fallback icon for empty state
function MessageIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
