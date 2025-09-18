import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Please provide email, password, and name' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'A user with this email already exists' 
      });
    }
    
    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim()
    });
    
    await newUser.save();
    
    // Log in the user automatically
    req.login(newUser, (err) => {
      if (err) {
        console.error('Auto-login error after registration:', err);
        return res.status(500).json({ message: 'Registration successful, but login failed' });
      }
      
      // Remove password from response
      const userResponse = newUser.toJSON();
      delete userResponse.password;
      
      res.status(201).json({
        message: 'Registration successful',
        user: userResponse
      });
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Internal server error during login' });
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: info.message || 'Invalid email or password' 
      });
    }
    
    req.login(user, (err) => {
      if (err) {
        console.error('Login session error:', err);
        return res.status(500).json({ message: 'Login failed' });
      }
      
      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      res.json({
        message: 'Login successful',
        user: userResponse
      });
    });
  })(req, res, next);
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 */
router.post('/logout', requireAuth, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Session cleanup failed' });
      }
      
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
});

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 */
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json({ 
      user: userResponse,
      authenticated: true 
    });
  } else {
    res.status(401).json({ 
      message: 'Not authenticated',
      authenticated: false 
    });
  }
});

/**
 * @route GET /api/auth/status
 * @desc Check authentication status
 */
router.get('/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null
  });
});

export default router;