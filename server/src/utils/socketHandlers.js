import { Chat, Message } from '../models/Chat.js';
import User from '../models/User.js';

const connectedUsers = new Map(); // Store socket connections

/**
 * Set up Socket.IO event handlers
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', async (socket) => { // <-- Added 'async'
    console.log(`User connected: ${socket.id}`);

    try {
      // Get userId from the initial handshake
      const userId = socket.handshake.auth.userId;

      if (!userId) {
        console.error('Authentication failed: No userId provided in handshake');
        socket.emit('error', { message: 'Authentication failed' });
        socket.disconnect(); // Disconnect unauthorized user
        return;
      }

      // Store user connection
      connectedUsers.set(socket.id, userId);
      socket.userId = userId; // <-- CRITICAL: Attach userId to socket

      // Update user's online status
      await User.findByIdAndUpdate(userId, { lastActive: new Date() });

      // Emit updated online users list
      broadcastOnlineUsers(io);

      console.log(`User ${userId} authenticated and connected`);

    } catch (error) {
      console.error('Connection error:', error);
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect();
      return;
    }

    // Handle joining a chat room
    socket.on('joinChat', async (chatId) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        // Verify user has access to this chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Leave previous chat rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join the new chat room
        socket.join(chatId);
        socket.currentChatId = chatId;

        // --- FIX: Fetch and send the chat history ---
        const messages = await Message.find({ chat: chatId })
          .populate('sender', 'name')
          .sort({ timestamp: 1 }); // Sort by oldest first

        // Send history only to the socket that just joined
        socket.emit('chatHistory', messages);
        // --- END OF FIX ---

        console.log(`User ${socket.userId} joined chat ${chatId}`);

      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content, chatType } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        if (!content || !content.trim()) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Verify user has access to this chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Create and save message
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content: content.trim(),
          chatType: chat.chatType
        });

        await message.save();

        // Update chat's last message and activity
        chat.lastMessage = {
          content: content.trim(),
          sender: socket.userId,
          timestamp: new Date()
        };
        chat.lastActivity = new Date();
        await chat.save();

        // Populate sender information
        await message.populate('sender', 'name');

        // Emit message to all participants in the chat
        io.to(chatId).emit('message', message);

        // Award points for sending messages
        const user = await User.findById(socket.userId);
        if (user && !user.badges.includes('Communicator')) {
          const leveledUp = user.addPoints(25);
          user.badges.push('Communicator');
          await user.save();

          // Notify user of achievement
          socket.emit('achievement', {
            badge: 'Communicator',
            points: 25,
            leveledUp
          });
        }

        console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;

      if (!socket.userId || !chatId) return;

      socket.to(chatId).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { chatId, messageId } = data;

        if (!socket.userId) return;

        // Update read status in message
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              user: socket.userId,
              readAt: new Date()
            }
          }
        });

        // Emit read receipt to other participants
        socket.to(chatId).emit('messageRead', {
          messageId,
          userId: socket.userId,
          readAt: new Date()
        });

      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', async () => {
      try {
        const userId = connectedUsers.get(socket.id);

        if (userId) {
          // Update user's last active time
          await User.findByIdAndUpdate(userId, { lastActive: new Date() });

          // Remove from connected users
          connectedUsers.delete(socket.id);

          // Emit updated online users list
          broadcastOnlineUsers(io);

          console.log(`User ${userId} disconnected`);
        }

      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

/**
 * Broadcast list of online users to all connected clients
 */
const broadcastOnlineUsers = (io) => {
  const onlineUserIds = Array.from(connectedUsers.values());
  io.emit('onlineUsers', onlineUserIds);
};

/**
 * Get online users
 */
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.values());
};

/**
 * Check if a user is online
 */
export const isUserOnline = (userId) => {
  return Array.from(connectedUsers.values()).includes(userId);
};