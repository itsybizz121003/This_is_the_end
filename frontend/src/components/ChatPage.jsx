import React, { useState, useEffect, useRef } from 'react';
import { getConversation, sendMessage } from '../services/api';
import { useChat } from '../context/ChatContext';
import { 
  Search, 
  MoreVertical, 
  Send, 
  User,
  Check,
  CheckCheck,
  Clock,
  MessageSquare
} from 'lucide-react';

const ChatPage = () => {
  const { 
    chats: contacts, 
    selectedContact, 
    setSelectedContact, 
    socket, 
    loading,
    resetUnreadCount 
  } = useChat();
  
  const selectedContactRef = useRef(null);
  const [messages, setMessages] = useState([]);

  // Sync ref with state for socket listener
  useEffect(() => {
    selectedContactRef.current = selectedContact;
    if (selectedContact) {
      resetUnreadCount(selectedContact._id);
    }
  }, [selectedContact]);

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Update messages list ONLY if it's the current conversation
      if (selectedContactRef.current && (message.contact === selectedContactRef.current._id)) {
        setMessages((prev) => {
          // Check for duplicate message ID to avoid double rendering
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (selectedContact) {
      fetchConversation(selectedContact._id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async (contactId) => {
    try {
      const { data } = await getConversation(contactId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const messageData = {
        contactId: selectedContact._id,
        text: newMessage
      };
      
      // The message will be added to the list via Socket.IO emit from backend
      await sendMessage(messageData);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100vh-100px)] bg-[#07071a] border border-white/5 rounded-2xl overflow-hidden m-4 shadow-2xl">
      {/* Sidebar - Contacts List */}
      <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#0d0d2b]">
        {/* Profile Header */}
        <div className="p-4 bg-[#1a1a3a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <span className="text-white font-medium">My Chat</span>
          </div>
          <div className="flex gap-4 text-slate-400">
            {/* <Smile size={20} className="cursor-pointer hover:text-white" /> */}
            <MoreVertical
              size={20}
              className="cursor-pointer hover:text-white"
            />
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full bg-[#1a1a3a] text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm border border-white/5 focus:outline-none focus:border-indigo-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-all duration-300 relative ${
                  selectedContact?._id === contact._id ? "bg-indigo-500/10 border-l-4 border-indigo-500" : "border-l-4 border-transparent"
                } ${contact.isBlinking ? "animate-chat-blink" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <span className="text-indigo-400 font-bold">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className={`text-slate-200 font-medium truncate ${contact.unreadCount > 0 ? "font-bold" : ""}`}>
                      {contact.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {contact.lastMessage?.timestamp 
                        ? new Date(contact.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : contact.phone}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-xs truncate flex-1 ${contact.unreadCount > 0 ? "text-slate-200 font-medium" : "text-slate-500"}`}>
                      {contact.lastMessage?.body || "Click to start chatting..."}
                    </p>
                    {contact.unreadCount > 0 && (
                      <span className="ml-2 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#07071a]">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-[#1a1a3a] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
                  <span className="text-indigo-400 font-bold">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {selectedContact.name}
                  </h3>
                  <span className="text-xs text-indigo-400">
                    {selectedContact.phone}
                  </span>
                </div>
              </div>
             
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-6 space-y-4 
  bg-[url('https://wallpapers.com/images/featured/dark-mode-nuyvgvwzb8ztc2zu.jpg')] 
  bg-[length:100%] bg-no-repeat bg-center"
            >
              {messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl shadow-lg relative group ${
                      msg.direction === "outgoing"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-[#1a1a3a] text-slate-200 rounded-tl-none border border-white/5"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1 opacity-70">
                      <span className="text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.direction === "outgoing" && (
                        <span>
                          {msg.status === "read" ? (
                            <CheckCheck size={14} className="text-blue-300" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck size={14} />
                          ) : msg.status === "sent" ? (
                            <Check size={14} />
                          ) : (
                            <Clock size={12} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[#1a1a3a] border-t border-white/5 flex items-center gap-4"
            >
              {/* <Smile
                size={24}
                className="text-slate-400 cursor-pointer hover:text-white"
              />
              <Paperclip
                size={24}
                className="text-slate-400 cursor-pointer hover:text-white"
              /> */}
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 bg-[#0d0d2b] text-slate-200 px-4 py-3 rounded-xl text-sm border border-white/5 focus:outline-none focus:border-indigo-500/50"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`p-3 rounded-xl bg-indigo-500 text-white transition-all ${!newMessage.trim() ? "opacity-50" : "hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"}`}
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={48} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ITSYBIZZ AI
            </h2>
            <p className="text-slate-400 max-w-md">
              Select a contact to start messaging. Your messages are
              synchronized with WhatsApp in real-time.
            </p>
            <div className="mt-12 flex items-center gap-2 text-slate-600 text-sm">
              {/* <Clock size={14} /> */}
              {/* <span>End-to-end encrypted</span> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
