import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration for profile pictures
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for chat files
const chatFileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/chat-files'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only (profile pictures)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures'));
  }
};

// File filter for chat files (more permissive)
const chatFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip|mp4|mp3|wav/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

// Determine file type category
export const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return 'image';
  } else if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
    return 'document';
  } else if (['.mp4', '.avi', '.mov'].includes(ext)) {
    return 'video';
  } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
    return 'audio';
  } else {
    return 'other';
  }
};

// Multer upload configurations
export const uploadProfilePicture = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for profile pictures
  },
  fileFilter: imageFilter
}).single('profilePicture');

export const uploadChatFile = multer({
  storage: chatFileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for chat files
  },
  fileFilter: chatFileFilter
}).single('file');
