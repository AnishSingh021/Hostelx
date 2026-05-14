const express = require('express');
const router = express.Router();
const { getUserChats, accessChat, sendMessage, markAsRead, reactToMessage, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.route('/unread').get(protect, getUnreadCount);

router.route('/')
  .get(protect, getUserChats)
  .post(protect, accessChat);

// Send message with optional image upload
router.route('/:chatId/messages')
  .post(protect, upload.single('image'), sendMessage);

// Mark all messages in a chat as read
router.route('/:chatId/read')
  .put(protect, markAsRead);

// React to a specific message
router.route('/:chatId/messages/:msgId/react')
  .put(protect, reactToMessage);

module.exports = router;
