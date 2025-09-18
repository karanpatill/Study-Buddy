import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Send, Users, MessageCircle, Wifi, WifiOff } from 'lucide-react';

interface Chat {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
  }>;
  chatType: 'direct' | 'group';
  name?: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
}

const Chat: React.FC = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { messages, sendMessage, joinChat, onlineUsers, isConnected, clearMessages } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setActiveChat(chat);
        loadChatMessages(chatId);
      }
    } else if (chats.length > 0 && !chatId) {
      // Auto-select first chat if no chatId in URL
      const firstChat = chats[0];
      setActiveChat(firstChat);
      loadChatMessages(firstChat._id);
      // Update URL without causing a page reload
      window.history.replaceState({}, '', `/chat/${firstChat._id}`);
    }
  }, [chatId, chats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats', { withCredentials: true });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    setLoadingMessages(true);
    clearMessages(); // Clear previous messages
    
    try {
      // Load existing messages from API
      const response = await axios.get(`/api/chats/${chatId}/messages`, { 
        withCredentials: true 
      });
      
      // Join the chat room for real-time updates
      joinChat(chatId);
      
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !isConnected) return;

    sendMessage(activeChat._id, messageInput.trim(), activeChat.chatType);
    setMessageInput('');
  };

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    loadChatMessages(chat._id);
    // Update URL
    window.history.pushState({}, '', `/chat/${chat._id}`);
  };

  const getChatName = (chat: Chat) => {
    if (chat.chatType === 'group') {
      return chat.name || 'Group Chat';
    }
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name || 'Unknown User';
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="flex items-center">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" title="Connected" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" title="Disconnected" />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No conversations yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Find study buddies on the dashboard to start chatting!
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeChat?._id === chat._id ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    {chat.chatType === 'group' ? (
                      <Users className="h-5 w-5 text-primary-600" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {getChatName(chat)}
                      </p>
                      {chat.chatType === 'direct' && (
                        <div className={`w-2 h-2 rounded-full ${
                          isUserOnline(chat.participants.find(p => p._id !== user?._id)?._id || '') 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}></div>
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
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    {activeChat.chatType === 'group' ? (
                      <Users className="h-5 w-5 text-primary-600" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getChatName(activeChat)}
                    </h3>
                    {activeChat.chatType === 'direct' && (
                      <p className="text-sm text-gray-600">
                        {isUserOnline(activeChat.participants.find(p => p._id !== user?._id)?._id || '') 
                          ? 'Online' 
                          : 'Offline'
                        }
                      </p>
                    )}
                    {activeChat.chatType === 'group' && (
                      <p className="text-sm text-gray-600">
                        {activeChat.participants.length} members
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isConnected && (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                      Disconnected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loadingMessages ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender._id === user?._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      }`}>
                        {!isOwnMessage && activeChat.chatType === 'group' && (
                          <p className="text-xs font-medium mb-1 text-gray-600">
                            {message.sender.name}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={isConnected ? "Type your message..." : "Connecting..."}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !isConnected}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">
                  Connection lost. Trying to reconnect...
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
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