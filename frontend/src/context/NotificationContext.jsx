import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000');

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    console.log('Notification socket listener initialized');
    
    socket.on('connect', () => {
      console.log('Socket connected successfully in context');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error in context:', error);
    });

    socket.on('new_message', (message) => {
      console.log('New message received in context:', message);
      if (message.direction === 'incoming') {
        const contactInfo = message.contactName || message.contactPhone || 'Unknown';
        const newNotif = {
          id: Date.now(),
          text: `${contactInfo}: ${message.body}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dot: 'bg-indigo-400',
          messageId: message._id,
          timestamp: new Date()
        };
        
        setNotifications(prev => [newNotif, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);

        // Add toast
        const toastId = Date.now();
        setToasts(prev => [...prev, { id: toastId, text: newNotif.text }]);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 5000);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('new_message');
    };
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAllAsRead, 
      clearNotifications,
      socket,
      toasts 
    }}>
      {children}
      
      {/* Toast Container */}
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
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
