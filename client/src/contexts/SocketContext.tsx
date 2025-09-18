import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  timestamp: Date;
  chatType: 'direct' | 'group';
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  joinChat: (chatId: string) => void;
  sendMessage: (chatId: string, content: string, chatType: 'direct' | 'group') => void;
  clearMessages: () => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('Connecting to socket server...');
      
      const newSocket = io('/', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server with ID:', newSocket.id);
        setIsConnected(true);
        
        // Authenticate with the server
        newSocket.emit('authenticate', { userId: user._id });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('message', (message: Message) => {
        console.log('Received message:', message);
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('onlineUsers', (users: string[]) => {
        console.log('Online users updated:', users);
        setOnlineUsers(users);
      });

      newSocket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });

      newSocket.on('achievement', (achievement: any) => {
        console.log('Achievement unlocked:', achievement);
        // You can add a toast notification here
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user]);

  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('Joining chat:', chatId);
      socket.emit('joinChat', chatId);
      // Clear previous messages when joining a new chat
      setMessages([]);
    } else {
      console.warn('Socket not connected, cannot join chat');
    }
  };

  const sendMessage = (chatId: string, content: string, chatType: 'direct' | 'group') => {
    if (socket && isConnected) {
      console.log('Sending message to chat:', chatId, content);
      socket.emit('sendMessage', { chatId, content, chatType });
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    socket,
    messages,
    onlineUsers,
    joinChat,
    sendMessage,
    clearMessages,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};