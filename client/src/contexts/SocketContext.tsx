import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  content: string;
  timestamp: Date;
  chatType: 'direct' | 'group';
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  connected: boolean;
  joinChat: (chatId: string) => void;
  sendMessage: (chatId: string, content: string, chatType: 'direct' | 'group') => void;
  clearMessages: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Use environment variable for backend URL, fallback to localhost
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const newSocket = io(backendUrl, {
      auth: { userId: user._id },
      transports: ['websocket'], // force WebSocket
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚠️ Disconnected from Socket.IO server');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    newSocket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('onlineUsers', (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  const joinChat = (chatId: string) => {
    if (socket) socket.emit('joinChat', chatId);
  };

  const sendMessage = (chatId: string, content: string, chatType: 'direct' | 'group') => {
    if (socket) socket.emit('sendMessage', { chatId, content, chatType });
  };

  const clearMessages = () => setMessages([]);

  return (
    <SocketContext.Provider
      value={{ socket, messages, onlineUsers, connected, joinChat, sendMessage, clearMessages }}
    >
      {children}
    </SocketContext.Provider>
  );
};
