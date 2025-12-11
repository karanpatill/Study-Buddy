import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Send, Users, MessageCircle, Wifi, WifiOff, Search, MoreVertical, Check, CheckCheck } from 'lucide-react';

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const formatTime = (date: Date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now.getTime() - msgDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-slate-900 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                socket?.connected && !isReconnecting
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-amber-50 text-amber-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  socket?.connected && !isReconnecting ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
                {socket?.connected && !isReconnecting ? 'Online' : 'Connecting'}
              </span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No conversations yet</p>
              <p className="text-gray-500 text-sm">Start chatting with your study group</p>
            </div>
          ) : (
            <div className="py-1">
              {chats.map((chat) => {
                const otherUser = chat.participants.find(p => p._id !== user?._id);
                const isOnline = otherUser && isUserOnline(otherUser._id);
                
                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      clearMessages();
                      setActiveChat(chat);
                      joinChat(chat._id);
                      window.history.pushState({}, '', `/chat/${chat._id}`);
                    }}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      activeChat?._id === chat._id 
                        ? 'bg-slate-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium ${
                          chat.chatType === 'group'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {chat.chatType === 'group' ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            getInitials(getChatName(chat))
                          )}
                        </div>
                        {chat.chatType === 'direct' && isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      
                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {getChatName(chat)}
                          </h3>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      activeChat.chatType === 'group'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {activeChat.chatType === 'group' ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        getInitials(getChatName(activeChat))
                      )}
                    </div>
                    {activeChat.chatType === 'direct' && 
                     isUserOnline(activeChat.participants.find(p => p._id !== user?._id)?._id || '') && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getChatName(activeChat)}
                    </h3>
                    {activeChat.chatType === 'direct' ? (
                      <p className="text-sm text-gray-500">
                        {isUserOnline(activeChat.participants.find(p => p._id !== user?._id)?._id || '') 
                          ? 'Active now' 
                          : 'Offline'
                        }
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {activeChat.participants.length} members
                      </p>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-6 w-6 text-gray-500" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">No messages yet</p>
                    <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender._id === user?._id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-lg ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwnMessage && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                              {getInitials(message.sender.name)}
                            </div>
                          )}
                          <div>
                            {!isOwnMessage && activeChat.chatType === 'group' && (
                              <p className="text-xs text-gray-600 mb-1 px-3">
                                {message.sender.name}
                              </p>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-slate-900 text-white rounded-br-sm'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                            }`}>
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-3 ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isOwnMessage && (
                                <CheckCheck className="h-3 w-3 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              {(!socket?.connected || isReconnecting) && (
                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
                  <WifiOff className="h-4 w-4" />
                  <span>Reconnecting to server...</span>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message"
                  disabled={!socket?.connected || isReconnecting}
                  className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !socket?.connected || isReconnecting}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;