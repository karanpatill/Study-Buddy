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
  connected: boolean; // ✅ added
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
  const [connected, setConnected] = useState(false); // ✅ added state

  useEffect(() => {
    if (user) {
      const backendUrl =
        import.meta.env.MODE === 'production'
          ? 'https://study-buddy-yitq.onrender.com'
          : 'http://localhost:5000';

      const newSocket = io(backendUrl, {
        auth: { userId: user._id },
        withCredentials: true,
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setConnected(false);
      });

      newSocket.on('message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('onlineUsers', (users: string[]) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinChat = (chatId: string) => {
    socket?.emit('joinChat', chatId);
  };

  const sendMessage = (chatId: string, content: string, chatType: 'direct' | 'group') => {
    socket?.emit('sendMessage', { chatId, content, chatType });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        onlineUsers,
        joinChat,
        sendMessage,
        clearMessages,
        connected, // ✅ provide connected status
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
