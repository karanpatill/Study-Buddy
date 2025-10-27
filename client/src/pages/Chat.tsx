import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Send, Users, MessageCircle, Wifi, WifiOff, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Chat {
  _id: string;
  participants: Array<{ _id: string; name: string }>;
  chatType: 'direct' | 'group';
  name?: string;
  lastMessage?: { content: string; timestamp: Date };
}

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  content: string;
  timestamp: Date;
  chatType: 'direct' | 'group';
}

const Chat: React.FC = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, messages, sendMessage, joinChat, onlineUsers, clearMessages } = useSocket();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find((c) => c._id === chatId);
      if (chat) {
        clearMessages();
        setActiveChat(chat);
        joinChat(chatId);
      }
    }
  }, [chatId, chats, joinChat, clearMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleReconnectAttempt = () => setIsReconnecting(true);
    const handleReconnect = () => setIsReconnecting(false);
    const handleDisconnect = () => setIsReconnecting(true);

    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect', handleReconnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect', handleReconnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats', { withCredentials: true });
      setChats(response.data);
      if (!chatId && response.data.length > 0) {
        clearMessages();
        setActiveChat(response.data[0]);
        joinChat(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;
    sendMessage(activeChat._id, messageInput.trim(), activeChat.chatType);
    setMessageInput('');
  };

  const getChatName = (chat: Chat) => {
    if (chat.chatType === 'group') return chat.name || 'Group Chat';
    const other = chat.participants.find((p) => p._id !== user?._id);
    return other?.name || 'Unknown User';
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden flex">
      {/* glowing background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Chat List */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-white/10 backdrop-blur-lg border-r border-white/10 flex flex-col relative z-10"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MessageCircle className="h-6 w-6 mr-3 text-blue-400" /> Messages
          </h2>
          {socket?.connected && !isReconnecting ? (
            <Wifi className="h-5 w-5 text-green-400 animate-pulse" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {chats.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <p className="text-white/70">No conversations yet</p>
              <p className="text-white/50 text-sm">Find study buddies to start chatting!</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  clearMessages();
                  setActiveChat(chat);
                  joinChat(chat._id);
                  window.history.pushState({}, '', `/chat/${chat._id}`);
                }}
                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-all duration-300 ${
                  activeChat?._id === chat._id ? 'bg-white/10 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                    {chat.chatType === 'group' ? (
                      <Users className="h-6 w-6 text-white" />
                    ) : (
                      <MessageCircle className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white truncate">{getChatName(chat)}</p>
                      {chat.chatType === 'direct' && (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isUserOnline(chat.participants.find((p) => p._id !== user?._id)?._id || '')
                              ? 'bg-green-400 animate-pulse'
                              : 'bg-gray-500'
                          }`}
                        ></div>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-white/60 truncate mt-1">{chat.lastMessage.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex-1 flex flex-col relative z-10"
      >
        {activeChat ? (
          <>
            <div className="bg-white/10 border-b border-white/10 p-6 backdrop-blur-xl flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                {activeChat.chatType === 'group' ? <Users className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{getChatName(activeChat)}</h3>
                {activeChat.chatType === 'direct' && (
                  <p className="text-sm text-white/60 flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isUserOnline(activeChat.participants.find((p) => p._id !== user?._id)?._id || '')
                          ? 'bg-green-400 animate-pulse'
                          : 'bg-gray-500'
                      }`}
                    ></span>
                    {isUserOnline(activeChat.participants.find((p) => p._id !== user?._id)?._id || '') ? 'Online' : 'Offline'}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-white/70 mb-2">No messages yet</p>
                  <p className="text-white/50 text-sm">Start the conversation and break the ice!</p>
                </div>
              ) : (
                messages.map((message, i) => {
                  const isOwnMessage = message.sender._id === user?._id;
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'bg-white/10 text-white border border-white/20 backdrop-blur-md'
                        }`}
                      >
                        {!isOwnMessage && activeChat.chatType === 'group' && (
                          <p className="text-xs font-medium mb-1 text-white/80">{message.sender.name}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-2 ${isOwnMessage ? 'text-white/70' : 'text-white/50'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/10 border-t border-white/10 p-4 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={!socket?.connected || isReconnecting}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !socket?.connected || isReconnecting}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  <Send className="h-5 w-5 mr-2" /> Send
                </button>
              </form>
              {(!socket?.connected || isReconnecting) && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <WifiOff className="h-4 w-4 mr-2" /> Reconnecting to chat server...
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Select a conversation</h3>
              <p className="text-white/60 mb-6">Choose a chat from the sidebar to start messaging</p>
              <div className="flex items-center justify-center text-sm text-white/50">
                <Zap className="h-4 w-4 mr-2" /> Real-time messaging powered by AI
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Chat;
