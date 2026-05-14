const Chat = require('../models/Chat');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name profileImage')
      .populate('product', 'title images price')
      .sort({ lastMessageAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
};

// @desc    Get or create a chat between two users for a product
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ message: 'UserId or ProductId missing' });
  }
  try {
    let isChat = await Chat.find({
      product: productId,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } }
      ]
    })
      .populate('participants', 'name profileImage')
      .populate('product', 'title images');

    if (isChat.length > 0) {
      res.json(isChat[0]);
    } else {
      const createdChat = await Chat.create({
        product: productId,
        participants: [req.user._id, userId],
      });
      const FullChat = await Chat.findOne({ _id: createdChat._id })
        .populate('participants', 'name profileImage')
        .populate('product', 'title images');
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error accessing chat' });
  }
};

// @desc    Send a new message (text or image)
// @route   POST /api/chats/:chatId/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { text } = req.body;
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    let newMessage = {
      sender: req.user._id,
      read: false
    };

    // Handle image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      newMessage.image = result.secure_url;
      newMessage.type = 'image';
      newMessage.text = '';
    } else if (text) {
      newMessage.text = text;
      newMessage.type = 'text';
    } else {
      return res.status(400).json({ message: 'Message must have text or image' });
    }

    chat.messages.push(newMessage);
    chat.lastMessageAt = Date.now();
    await chat.save();

    // Populate the saved chat for response
    const populated = await Chat.findById(chatId)
      .populate('participants', 'name profileImage')
      .populate('product', 'title images');

    res.json(populated);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// @desc    Mark all messages in a chat as read
// @route   PUT /api/chats/:chatId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    // Atomic update: mark all messages from OTHER users as read
    await Chat.updateOne(
      { _id: req.params.chatId },
      {
        $set: {
          'messages.$[elem].read': true,
          'messages.$[elem].readAt': new Date()
        }
      },
      {
        arrayFilters: [
          { 'elem.sender': { $ne: req.user._id }, 'elem.read': false }
        ]
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ message: 'Error marking as read' });
  }
};

// @desc    Add or remove emoji reaction on a message
// @route   PUT /api/chats/:chatId/messages/:msgId/react
// @access  Private
const reactToMessage = async (req, res) => {
  const { emoji } = req.body;
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = chat.messages.id(req.params.msgId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const existingIdx = message.reactions.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingIdx > -1) {
      // Toggle off if same emoji, or change emoji
      if (message.reactions[existingIdx].emoji === emoji) {
        message.reactions.splice(existingIdx, 1);
      } else {
        message.reactions[existingIdx].emoji = emoji;
      }
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }

    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error reacting to message' });
  }
};

// @desc    Get count of TOTAL unread messages across all chats
// @route   GET /api/chats/unread
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id });
    let totalUnread = 0;
    for (const chat of chats) {
      // Count individual unread messages, not just chats
      const unreadInChat = chat.messages.filter(
        m => !m.read && m.sender.toString() !== req.user._id.toString()
      ).length;
      totalUnread += unreadInChat;
    }
    res.json({ unread: totalUnread });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

module.exports = { getUserChats, accessChat, sendMessage, markAsRead, reactToMessage, getUnreadCount };
