/**
 * Authentication middleware to ensure user is logged in
 */
export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ 
    message: 'Authentication required. Please log in to continue.' 
  });
};

/**
 * Middleware to check if user's profile is complete
 */
export const requireCompleteProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if profile has minimum required fields
    const user = req.user;
    const hasRequiredFields = user.subjects && user.subjects.length > 0 && 
                            user.goals && user.goals.length > 0;
    
    if (!hasRequiredFields) {
      return res.status(400).json({ 
        message: 'Please complete your profile to access this feature',
        requiresProfileCompletion: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Profile completion check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to add user object to request if authenticated (optional auth)
 */
export const optionalAuth = (req, res, next) => {
  // This middleware doesn't block access, just adds user if available
  next();
};