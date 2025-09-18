import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import StudyGroup from '../models/StudyGroup.js';
import { Chat, Message } from '../models/Chat.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Sample data for seeding the database
 */
const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    subjects: ['Mathematics', 'Physics', 'Computer Science'],
    goals: ['Master calculus', 'Understand quantum mechanics', 'Learn React'],
    schedule: {
      'Monday': ['Morning (9-12 PM)', 'Evening (5-8 PM)'],
      'Wednesday': ['Afternoon (12-5 PM)'],
      'Friday': ['Evening (5-8 PM)', 'Night (8-11 PM)']
    },
    points: 1250,
    level: 2,
    badges: ['First Steps', 'Study Enthusiast', 'Profile Master']
  },
  {
    name: 'Bob Chen',
    email: 'bob@example.com',
    password: 'password123',
    subjects: ['Chemistry', 'Biology', 'Mathematics'],
    goals: ['Ace organic chemistry', 'Understand genetics', 'Improve problem-solving'],
    schedule: {
      'Tuesday': ['Morning (9-12 PM)', 'Afternoon (12-5 PM)'],
      'Thursday': ['Evening (5-8 PM)'],
      'Saturday': ['Morning (9-12 PM)']
    },
    points: 850,
    level: 1,
    badges: ['First Steps', 'Multi-Subject Scholar']
  },
  {
    name: 'Carol Davis',
    email: 'carol@example.com',
    password: 'password123',
    subjects: ['Psychology', 'Philosophy', 'Literature'],
    goals: ['Understand cognitive psychology', 'Explore ethics', 'Analyze classic literature'],
    schedule: {
      'Monday': ['Afternoon (12-5 PM)'],
      'Wednesday': ['Evening (5-8 PM)'],
      'Friday': ['Morning (9-12 PM)'],
      'Sunday': ['Afternoon (12-5 PM)']
    },
    points: 2100,
    level: 3,
    badges: ['First Steps', 'Study Enthusiast', 'Study Master', 'Profile Master']
  },
  {
    name: 'David Rodriguez',
    email: 'david@example.com',
    password: 'password123',
    subjects: ['History', 'Economics', 'Political Science'],
    goals: ['Learn world history', 'Understand market economics', 'Study government systems'],
    schedule: {
      'Tuesday': ['Evening (5-8 PM)'],
      'Thursday': ['Morning (9-12 PM)', 'Afternoon (12-5 PM)'],
      'Saturday': ['Evening (5-8 PM)']
    },
    points: 650,
    level: 1,
    badges: ['First Steps', 'Team Player']
  },
  {
    name: 'Eva Martinez',
    email: 'eva@example.com',
    password: 'password123',
    subjects: ['Computer Science', 'Mathematics', 'Statistics'],
    goals: ['Master algorithms', 'Learn machine learning', 'Understand data analysis'],
    schedule: {
      'Monday': ['Night (8-11 PM)'],
      'Wednesday': ['Morning (9-12 PM)', 'Evening (5-8 PM)'],
      'Friday': ['Afternoon (12-5 PM)'],
      'Saturday': ['Night (8-11 PM)']
    },
    points: 1800,
    level: 2,
    badges: ['First Steps', 'Study Enthusiast', 'Multi-Subject Scholar', 'Leader']
  }
];

const sampleGroups = [
  {
    name: 'Advanced Mathematics Study Group',
    description: 'A group for students tackling advanced mathematical concepts including calculus, linear algebra, and differential equations.',
    subject: 'Mathematics',
    maxMembers: 8,
    schedule: {
      'Tuesday': ['Evening (5-8 PM)'],
      'Thursday': ['Evening (5-8 PM)'],
      'Saturday': ['Afternoon (12-5 PM)']
    },
    tags: ['calculus', 'linear-algebra', 'advanced'],
    isPrivate: false
  },
  {
    name: 'Computer Science Fundamentals',
    description: 'Learn programming, data structures, algorithms, and software engineering principles together.',
    subject: 'Computer Science',
    maxMembers: 10,
    schedule: {
      'Monday': ['Evening (5-8 PM)'],
      'Wednesday': ['Evening (5-8 PM)'],
      'Friday': ['Afternoon (12-5 PM)']
    },
    tags: ['programming', 'algorithms', 'data-structures'],
    isPrivate: false
  },
  {
    name: 'Biology and Life Sciences',
    description: 'Explore biology, genetics, ecology, and life sciences with fellow students.',
    subject: 'Biology',
    maxMembers: 6,
    schedule: {
      'Tuesday': ['Afternoon (12-5 PM)'],
      'Thursday': ['Morning (9-12 PM)'],
      'Sunday': ['Afternoon (12-5 PM)']
    },
    tags: ['genetics', 'ecology', 'life-sciences'],
    isPrivate: false
  }
];

/**
 * Hash passwords for sample users
 */
const hashPasswords = async (users) => {
  for (let user of users) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    user.profileCompleted = true;
  }
  return users;
};

/**
 * Clear existing data from database
 */
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await StudyGroup.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

/**
 * Create sample users
 */
const createUsers = async () => {
  try {
    const hashedUsers = await hashPasswords(sampleUsers);
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
};

/**
 * Create sample study groups
 */
const createStudyGroups = async (users) => {
  try {
    const groupsWithAdmins = sampleGroups.map((group, index) => ({
      ...group,
      admin: users[index % users.length]._id,
      members: [{
        user: users[index % users.length]._id,
        role: 'admin',
        joinedAt: new Date()
      }],
      schedule: new Map(Object.entries(group.schedule))
    }));
    
    const createdGroups = await StudyGroup.insertMany(groupsWithAdmins);
    console.log(`✅ Created ${createdGroups.length} study groups`);
    return createdGroups;
  } catch (error) {
    console.error('❌ Error creating study groups:', error);
    throw error;
  }
};

/**
 * Create sample chats
 */
const createChats = async (users) => {
  try {
    // Create a few direct chats
    const directChats = [
      {
        participants: [users[0]._id, users[1]._id],
        chatType: 'direct',
        lastMessage: {
          content: 'Hey, want to study math together?',
          sender: users[0]._id,
          timestamp: new Date()
        }
      },
      {
        participants: [users[1]._id, users[2]._id],
        chatType: 'direct',
        lastMessage: {
          content: 'Sure! When are you free?',
          sender: users[2]._id,
          timestamp: new Date()
        }
      },
      {
        participants: [users[0]._id, users[4]._id],
        chatType: 'direct',
        lastMessage: {
          content: 'Let\'s work on that computer science project',
          sender: users[4]._id,
          timestamp: new Date()
        }
      },
      {
        participants: [users[2]._id, users[3]._id],
        chatType: 'direct',
        lastMessage: {
          content: 'Psychology study session tomorrow?',
          sender: users[2]._id,
          timestamp: new Date()
        }
      },
      {
        participants: [users[3]._id, users[4]._id],
        chatType: 'direct',
        lastMessage: {
          content: 'Economics homework help needed!',
          sender: users[3]._id,
          timestamp: new Date()
        }
      }
    ];
    
    const createdChats = await Chat.insertMany(directChats);
    console.log(`✅ Created ${createdChats.length} chats`);
    
    // Create some sample messages
    const sampleMessages = [
      {
        chat: createdChats[0]._id,
        sender: users[0]._id,
        content: 'Hey, want to study math together?',
        chatType: 'direct'
      },
      {
        chat: createdChats[0]._id,
        sender: users[1]._id,
        content: 'Absolutely! I\'m struggling with calculus',
        chatType: 'direct'
      },
      {
        chat: createdChats[0]._id,
        sender: users[0]._id,
        content: 'Perfect! I can help with that. When are you free?',
        chatType: 'direct'
      },
      {
        chat: createdChats[1]._id,
        sender: users[1]._id,
        content: 'How\'s your chemistry study going?',
        chatType: 'direct'
      },
      {
        chat: createdChats[1]._id,
        sender: users[2]._id,
        content: 'Pretty good! The organic chemistry is challenging though',
        chatType: 'direct'
      },
      {
        chat: createdChats[1]._id,
        sender: users[1]._id,
        content: 'I have some great resources that might help!',
        chatType: 'direct'
      },
      {
        chat: createdChats[2]._id,
        sender: users[4]._id,
        content: 'Let\'s work on that computer science project',
        chatType: 'direct'
      },
      {
        chat: createdChats[2]._id,
        sender: users[0]._id,
        content: 'Great idea! When are you available?',
        chatType: 'direct'
      },
      {
        chat: createdChats[3]._id,
        sender: users[2]._id,
        content: 'Psychology study session tomorrow?',
        chatType: 'direct'
      },
      {
        chat: createdChats[3]._id,
        sender: users[3]._id,
        content: 'Yes! What time works for you?',
        chatType: 'direct'
      },
      {
        chat: createdChats[4]._id,
        sender: users[3]._id,
        content: 'Economics homework help needed!',
        chatType: 'direct'
      },
      {
        chat: createdChats[4]._id,
        sender: users[4]._id,
        content: 'I can help! What specific topics?',
        chatType: 'direct'
      }
    ];
    
    const createdMessages = await Message.insertMany(sampleMessages);
    console.log(`✅ Created ${createdMessages.length} messages`);
    
    return createdChats;
  } catch (error) {
    console.error('❌ Error creating chats:', error);
    throw error;
  }
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    await clearDatabase();
    console.log();
    
    // Create sample data
    const users = await createUsers();
    console.log();
    
    const groups = await createStudyGroups(users);
    console.log();
    
    const chats = await createChats(users);
    console.log();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Study Groups: ${groups.length}`);
    console.log(`   Chats: ${chats.length}`);
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Email: alice@example.com');
    console.log('   Password: password123');
    console.log('\n   Email: bob@example.com');
    console.log('   Password: password123');
    console.log('\n   (All sample users use "password123")');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

// Run seeding if called directly
seedDatabase();


export default seedDatabase;