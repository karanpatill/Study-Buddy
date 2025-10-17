# Study Buddy Matcher 📚

A comprehensive full-stack web application that connects students with compatible study partners based on subjects, learning goals, and schedules. Built with React, Node.js, Express, and MongoDB.

## 🌟 Features

### Frontend (React + Tailwind CSS)
- **Authentication System**: Secure email/password login and registration
- **Smart Dashboard**: View study matches, groups, and personal statistics
- **Real-time Chat**: One-on-one and group messaging with Socket.IO
- **Profile Management**: Set subjects, goals, and study schedules
- **Gamification**: Points, badges, levels, and leaderboard system
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Backend (Node.js + Express)
- **RESTful API**: Comprehensive endpoints for all features
- **Authentication**: Passport.js with local strategy
- **Real-time Communication**: Socket.IO for instant messaging
- **Smart Matching Algorithm**: Compatible study partner suggestions
- **Database Management**: MongoDB with Mongoose ODM
- **Security**: Rate limiting, CORS, and secure sessions

### Key Functionality
- **Study Buddy Matching**: AI-powered compatibility scoring based on:
  - Shared subjects (40% weight)
  - Similar learning goals (30% weight)
  - Compatible schedules (30% weight)
- **Study Groups**: Create and join subject-specific study groups
- **Real-time Messaging**: Instant chat with typing indicators and read receipts
- **Gamification System**: 
  - Points for various activities
  - Achievement badges
  - Level progression
  - Global leaderboard
- **Profile Customization**: Detailed preferences for optimal matching

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd study-buddy-matcher
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example server/.env

# Edit server/.env with your configuration
```

4. **Configure MongoDB**
   - Create a MongoDB Atlas cluster or use local MongoDB
   - Add your connection string to `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studybuddy
```

5. **Seed the database (optional)**
```bash
cd server && npm run seed
```

6. **Start the application**
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 🗂️ Project Structure

```
study-buddy-matcher/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Main application pages
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Required
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secure_session_secret

# Optional
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and add it to `.env`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/:userId` - Get public profile

### Study Matching
- `GET /api/matching/matches` - Get compatible study partners
- `GET /api/matching/suggestions` - Get study suggestions
- `POST /api/matching/connect` - Send connection request

### Chat System
- `GET /api/chats` - Get user's chats
- `POST /api/chats/direct` - Create direct chat
- `POST /api/chats/group` - Create group chat
- `GET /api/chats/:id/messages` - Get chat messages

### Study Groups
- `GET /api/groups` - Get study groups
- `POST /api/groups` - Create study group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Gamification
- `GET /api/gamification/leaderboard` - Get leaderboard
- `POST /api/gamification/award-points` - Award points
- `GET /api/gamification/achievements` - Get achievements

## 🎮 Gamification System

### Point System
- Profile completion: 50-100 points
- First message: 25 points
- Join study group: 25 points
- Create study group: 100 points
- Daily check-in: 10 points

### Achievement Badges
- **First Steps**: Earn 100 points
- **Study Enthusiast**: Reach 500 points
- **Study Master**: Reach 2000 points
- **Multi-Subject Scholar**: Study 5+ subjects
- **Team Player**: Join a study group
- **Leader**: Create a study group
- **Communicator**: Send first message
- **Profile Master**: Complete full profile

### Level System
- Level 1: 0-999 points
- Level 2: 1000-1999 points
- Level 3: 2000-2999 points
- And so on...

## 🔐 Security Features

- Password hashing with bcryptjs
- Session-based authentication
- CSRF protection
- Rate limiting
- Input validation and sanitization
- Secure HTTP headers with Helmet

## 🚀 Deployment

### Render Deployment (Recommended)

1. **Prepare for deployment**
   - Ensure all environment variables are set
   - Update `CLIENT_URL` in production settings

2. **Deploy Backend**
   - Create new Web Service on Render
   - Connect your repository
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && npm start`
   - Add environment variables

3. **Deploy Frontend**
   - Create new Static Site on Render
   - Set build command: `cd client && npm run build`
   - Set publish directory: `client/dist`

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
SESSION_SECRET=your_production_session_secret
CLIENT_URL=https://your-frontend-domain.com
PORT=5000
```

## 🧪 Sample Data

The application includes a seeding script with sample users and data for testing:

```bash
cd server && npm run seed
```

**Sample Login Credentials:**
- Email: `alice@example.com` | Password: `password123`
- Email: `bob@example.com` | Password: `password123`
- Email: `carol@example.com` | Password: `password123`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the setup instructions
3. Ensure all dependencies are installed correctly
4. Verify environment variables are configured properly

## 🎯 Future Enhancements

- Video calling integration
- Calendar scheduling
- File sharing capabilities
- Mobile app development
- AI-powered study recommendations
- Study session tracking
- Progress analytics
- Social media integration

---

**Happy Studying! 🎓**