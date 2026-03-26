import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getContacts } from '../services/api';

const ChatContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const selectedContactRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const processedMessagesRef = useRef(new Set());

  // Sync ref with selectedContact state for socket listener access
  useEffect(() => {
    selectedContactRef.current = selectedContact;
    if (selectedContact) {
      resetUnreadCount(selectedContact._id);
    }
  }, [selectedContact]);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Chat Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Chat Socket connection error:', err);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch initial chats
  useEffect(() => {
    const fetchInitialChats = async () => {
      try {
        setLoading(true);
        const { data } = await getContacts();
        const initializedChats = data.map(chat => ({
          ...chat,
          unreadCount: chat.unreadCount || 0,
          isBlinking: false
        }));
        setChats(initializedChats);
        
        const total = initializedChats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
        setTotalUnreadCount(total);
      } catch (err) {
        console.error('Error fetching initial chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialChats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log('Global new message received:', message);
      
      // Strict deduplication check at the very beginning
      if (message._id && processedMessagesRef.current.has(message._id)) {
        console.log('Skipping already processed message:', message._id);
        return;
      }
      
      if (message._id) {
        processedMessagesRef.current.add(message._id);
      }

      setChats(prevChats => {
        const contactIdx = prevChats.findIndex(c => c._id === message.contact);
        if (contactIdx === -1) return prevChats;

        const updatedChats = [...prevChats];
        const chat = { ...updatedChats[contactIdx] };

        chat.lastMessage = {
          body: message.body,
          timestamp: message.timestamp
        };

        if (message.direction === 'incoming') {
          const isCurrentChat = selectedContactRef.current && selectedContactRef.current._id === message.contact;
          
          if (!isCurrentChat) {
            chat.unreadCount = (chat.unreadCount || 0) + 1;
            chat.isBlinking = true;
          }
        }

        updatedChats.splice(contactIdx, 1);
        return [chat, ...updatedChats];
      });

      // Side effects handled outside setChats to prevent duplication in StrictMode
      if (message.direction === 'incoming') {
        const isCurrentChat = selectedContactRef.current && selectedContactRef.current._id === message.contact;
        
        if (!isCurrentChat) {
          setTotalUnreadCount(prev => prev + 1);

          setNotifications(prev => {
            const newNotif = {
              id: Date.now(),
              text: `${message.contactName || 'New Message'}: ${message.body}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dot: 'bg-indigo-400',
              messageId: message._id,
              timestamp: new Date()
            };
            return [newNotif, ...prev].slice(0, 10);
          });

          setToasts(prev => {
            const toastId = Date.now();
            const newToast = { 
              id: toastId, 
              messageId: message._id,
              text: `${message.contactName || 'New Message'}: ${message.body}` 
            };
            
            setTimeout(() => {
              setToasts(curr => curr.filter(t => t.id !== toastId));
            }, 5000);

            return [...prev, newToast];
          });

          // Stop blinking after 5 seconds
          setTimeout(() => {
            setChats(curr => curr.map(c => 
              c._id === message.contact ? { ...c, isBlinking: false } : c
            ));
          }, 5000);
        }
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket]);

  const resetUnreadCount = (contactId) => {
    setChats(prev => prev.map(chat => {
      if (chat._id === contactId && chat.unreadCount > 0) {
        setTotalUnreadCount(total => Math.max(0, total - chat.unreadCount));
        return { ...chat, unreadCount: 0, isBlinking: false };
      }
      return chat;
    }));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    chats,
    setChats,
    selectedContact,
    setSelectedContact,
    loading,
    socket,
    totalUnreadCount,
    resetUnreadCount,
    notifications,
    toasts,
    clearNotifications
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      
      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3">
        {toasts.map(toast => (
          <div 
             key={toast.id}
             className="bg-[#1a1a3a] border border-indigo-500/30 text-white px-5 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-toast"
           >
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-blink shrink-0" />
            <p className="text-sm font-medium">{toast.text}</p>
          </div>
        ))}
      </div>
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
