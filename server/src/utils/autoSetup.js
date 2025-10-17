import User from '../models/User.js';
import StudyGroup from '../models/StudyGroup.js';
import { Chat, Message } from '../models/Chat.js';
import bcrypt from 'bcryptjs';

/**
 * Automatically setup database with sample data on first deployment
 * This ensures the app works immediately without manual seeding
 */
export const autoSetupDatabase = async () => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Database already contains data, skipping auto-setup');
      return;
    }

    console.log('🚀 Auto-setting up database with sample data...');

    // Create sample users with hashed passwords
    const sampleUsers = await createSampleUsers();
    console.log(`✅ Created ${sampleUsers.length} sample users`);

    // Create sample study groups
    const sampleGroups = await createSampleGroups(sampleUsers);
    console.log(`✅ Created ${sampleGroups.length} study groups`);

    // Create sample chats and messages
    const sampleChats = await createSampleChats(sampleUsers);
    console.log(`✅ Created ${sampleChats.length} chat conversations`);

    console.log('🎉 Auto-setup complete! App is ready to use.');
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Email: demo@studybuddy.com | Password: demo123');
    console.log('   Email: alice@studybuddy.com | Password: demo123');
    console.log('   Email: bob@studybuddy.com | Password: demo123');

  } catch (error) {
    console.error('❌ Auto-setup failed:', error);
  }
};

const createSampleUsers = async () => {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('demo123', salt);

  const users = [
    {
      name: 'Demo User',
      email: 'demo@studybuddy.com',
      password: hashedPassword,
      subjects: ['Computer Science', 'Mathematics', 'Physics'],
      goals: ['Master algorithms', 'Learn machine learning', 'Ace calculus'],
      schedule: new Map([
        ['Monday', ['Morning (9-12 PM)', 'Evening (5-8 PM)']],
        ['Wednesday', ['Afternoon (12-5 PM)', 'Evening (5-8 PM)']],
        ['Friday', ['Morning (9-12 PM)', 'Night (8-11 PM)']]
      ]),
      points: 1500,
      level: 2,
      badges: ['First Steps', 'Study Enthusiast', 'Profile Master', 'Communicator'],
      profileCompleted: true
    },
    {
      name: 'Alice Johnson',
      email: 'alice@studybuddy.com',
      password: hashedPassword,
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      goals: ['Master calculus', 'Understand quantum mechanics', 'Excel in organic chemistry'],
      schedule: new Map([
        ['Tuesday', ['Morning (9-12 PM)', 'Afternoon (12-5 PM)']],
        ['Thursday', ['Evening (5-8 PM)']],
        ['Saturday', ['Morning (9-12 PM)', 'Afternoon (12-5 PM)']]
      ]),
      points: 2100,
      level: 3,
      badges: ['First Steps', 'Study Enthusiast', 'Study Master', 'Multi-Subject Scholar', 'Team Player'],
      profileCompleted: true
    },
    {
      name: 'Bob Chen',
      email: 'bob@studybuddy.com',
      password: hashedPassword,
      subjects: ['Computer Science', 'Statistics', 'Economics'],
      goals: ['Learn data science', 'Master statistics', 'Understand market economics'],
      schedule: new Map([
        ['Monday', ['Evening (5-8 PM)']],
        ['Wednesday', ['Morning (9-12 PM)', 'Evening (5-8 PM)']],
        ['Friday', ['Afternoon (12-5 PM)']],
        ['Sunday', ['Morning (9-12 PM)']]
      ]),
      points: 1800,
      level: 2,
      badges: ['First Steps', 'Study Enthusiast', 'Leader', 'Communicator'],
      profileCompleted: true
    },
    {
      name: 'Carol Davis',
      email: 'carol@studybuddy.com',
      password: hashedPassword,
      subjects: ['Psychology', 'Biology', 'Philosophy'],
      goals: ['Understand cognitive psychology', 'Master genetics', 'Explore ethics'],
      schedule: new Map([
        ['Tuesday', ['Afternoon (12-5 PM)']],
        ['Thursday', ['Morning (9-12 PM)', 'Evening (5-8 PM)']],
        ['Saturday', ['Evening (5-8 PM)']],
        ['Sunday', ['Afternoon (12-5 PM)']]
      ]),
      points: 1200,
      level: 2,
      badges: ['First Steps', 'Study Enthusiast', 'Multi-Subject Scholar'],
      profileCompleted: true
    },
    {
      name: 'David Rodriguez',
      email: 'david@studybuddy.com',
      password: hashedPassword,
      subjects: ['History', 'Literature', 'Political Science'],
      goals: ['Learn world history', 'Analyze classic literature', 'Study government systems'],
      schedule: new Map([
        ['Monday', ['Afternoon (12-5 PM)']],
        ['Wednesday', ['Evening (5-8 PM)']],
        ['Friday', ['Morning (9-12 PM)']],
        ['Saturday', ['Night (8-11 PM)']]
      ]),
      points: 950,
      level: 1,
      badges: ['First Steps', 'Team Player', 'Profile Master'],
      profileCompleted: true
    },
    {
      name: 'Eva Martinez',
      email: 'eva@studybuddy.com',
      password: hashedPassword,
      subjects: ['Engineering', 'Mathematics', 'Physics'],
      goals: ['Master engineering principles', 'Excel in advanced math', 'Understand thermodynamics'],
      schedule: new Map([
        ['Tuesday', ['Morning (9-12 PM)']],
        ['Thursday', ['Afternoon (12-5 PM)', 'Evening (5-8 PM)']],
        ['Saturday', ['Morning (9-12 PM)']],
        ['Sunday', ['Evening (5-8 PM)']]
      ]),
      points: 1650,
      level: 2,
      badges: ['First Steps', 'Study Enthusiast', 'Leader', 'Multi-Subject Scholar'],
      profileCompleted: true
    }
  ];

  return await User.insertMany(users);
};

const createSampleGroups = async (users) => {
  const groups = [
    {
      name: 'Advanced Computer Science',
      description: 'Deep dive into algorithms, data structures, and system design. Perfect for CS majors and professionals.',
      subject: 'Computer Science',
      admin: users[0]._id,
      members: [
        { user: users[0]._id, role: 'admin', joinedAt: new Date() },
        { user: users[2]._id, role: 'member', joinedAt: new Date() }
      ],
      maxMembers: 8,
      schedule: new Map([
        ['Tuesday', ['Evening (5-8 PM)']],
        ['Thursday', ['Evening (5-8 PM)']],
        ['Saturday', ['Afternoon (12-5 PM)']]
      ]),
      tags: ['algorithms', 'data-structures', 'system-design'],
      isPrivate: false
    },
    {
      name: 'Mathematics Mastery',
      description: 'Tackle advanced mathematical concepts including calculus, linear algebra, and statistics.',
      subject: 'Mathematics',
      admin: users[1]._id,
      members: [
        { user: users[1]._id, role: 'admin', joinedAt: new Date() },
        { user: users[0]._id, role: 'member', joinedAt: new Date() },
        { user: users[5]._id, role: 'member', joinedAt: new Date() }
      ],
      maxMembers: 10,
      schedule: new Map([
        ['Monday', ['Evening (5-8 PM)']],
        ['Wednesday', ['Evening (5-8 PM)']],
        ['Friday', ['Afternoon (12-5 PM)']]
      ]),
      tags: ['calculus', 'linear-algebra', 'statistics'],
      isPrivate: false
    },
    {
      name: 'Science Explorers',
      description: 'Explore physics, chemistry, and biology with hands-on learning and collaborative problem-solving.',
      subject: 'Science',
      admin: users[3]._id,
      members: [
        { user: users[3]._id, role: 'admin', joinedAt: new Date() },
        { user: users[1]._id, role: 'member', joinedAt: new Date() }
      ],
      maxMembers: 6,
      schedule: new Map([
        ['Tuesday', ['Afternoon (12-5 PM)']],
        ['Thursday', ['Morning (9-12 PM)']],
        ['Sunday', ['Afternoon (12-5 PM)']]
      ]),
      tags: ['physics', 'chemistry', 'biology'],
      isPrivate: false
    },
    {
      name: 'Liberal Arts Discussion',
      description: 'Engage in thoughtful discussions about history, literature, philosophy, and social sciences.',
      subject: 'Liberal Arts',
      admin: users[4]._id,
      members: [
        { user: users[4]._id, role: 'admin', joinedAt: new Date() },
        { user: users[3]._id, role: 'member', joinedAt: new Date() }
      ],
      maxMembers: 8,
      schedule: new Map([
        ['Wednesday', ['Evening (5-8 PM)']],
        ['Friday', ['Morning (9-12 PM)']],
        ['Saturday', ['Evening (5-8 PM)']]
      ]),
      tags: ['history', 'literature', 'philosophy'],
      isPrivate: false
    }
  ];

  return await StudyGroup.insertMany(groups);
};

const createSampleChats = async (users) => {
  // Create direct chats
  const directChats = [
    {
      participants: [users[0]._id, users[1]._id],
      chatType: 'direct',
      lastMessage: {
        content: 'Hey! Want to work on that calculus problem set together?',
        sender: users[0]._id,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      participants: [users[0]._id, users[2]._id],
      chatType: 'direct',
      lastMessage: {
        content: 'The algorithm implementation looks great! Let\'s review it tomorrow.',
        sender: users[2]._id,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      lastActivity: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      participants: [users[1]._id, users[3]._id],
      chatType: 'direct',
      lastMessage: {
        content: 'Thanks for explaining that chemistry concept! It finally makes sense.',
        sender: users[1]._id,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      participants: [users[2]._id, users[4]._id],
      chatType: 'direct',
      lastMessage: {
        content: 'The study session was really productive. Same time next week?',
        sender: users[4]._id,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  const createdChats = await Chat.insertMany(directChats);

  // Create sample messages for each chat
  const messages = [
    // Chat 1 messages (Demo User & Alice)
    {
      chat: createdChats[0]._id,
      sender: users[0]._id,
      content: 'Hey Alice! I saw you\'re also studying calculus. Want to work together?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[0]._id,
      sender: users[1]._id,
      content: 'Absolutely! I\'m struggling with integration by parts.',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[0]._id,
      sender: users[0]._id,
      content: 'Perfect! I can help with that. Let\'s meet in the library tomorrow?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 2.2 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[0]._id,
      sender: users[1]._id,
      content: 'Sounds great! How about 2 PM?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 2.1 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[0]._id,
      sender: users[0]._id,
      content: 'Hey! Want to work on that calculus problem set together?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },

    // Chat 2 messages (Demo User & Bob)
    {
      chat: createdChats[1]._id,
      sender: users[0]._id,
      content: 'Bob, your data structures explanation was really helpful!',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[1]._id,
      sender: users[2]._id,
      content: 'Thanks! I love teaching algorithms. Want to tackle binary trees next?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      chat: createdChats[1]._id,
      sender: users[0]._id,
      content: 'Yes! I need to understand tree traversal better.',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 35 * 60 * 1000)
    },
    {
      chat: createdChats[1]._id,
      sender: users[2]._id,
      content: 'The algorithm implementation looks great! Let\'s review it tomorrow.',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    },

    // Chat 3 messages (Alice & Carol)
    {
      chat: createdChats[2]._id,
      sender: users[3]._id,
      content: 'Alice, I heard you\'re great at chemistry. Could you help me with organic reactions?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[2]._id,
      sender: users[1]._id,
      content: 'Of course! Organic chemistry can be tricky. What specific reactions?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[2]._id,
      sender: users[3]._id,
      content: 'Mainly substitution and elimination reactions. The mechanisms confuse me.',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 4.2 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[2]._id,
      sender: users[1]._id,
      content: 'Thanks for explaining that chemistry concept! It finally makes sense.',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },

    // Chat 4 messages (Bob & David)
    {
      chat: createdChats[3]._id,
      sender: users[2]._id,
      content: 'David, how\'s your political science research going?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[3]._id,
      sender: users[4]._id,
      content: 'Really well! I\'m analyzing voting patterns. Your statistics knowledge would be helpful.',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 6.5 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[3]._id,
      sender: users[2]._id,
      content: 'I\'d love to help! Statistical analysis is my favorite part of data science.',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 6.2 * 60 * 60 * 1000)
    },
    {
      chat: createdChats[3]._id,
      sender: users[4]._id,
      content: 'The study session was really productive. Same time next week?',
      chatType: 'direct',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  await Message.insertMany(messages);

  return createdChats;
};