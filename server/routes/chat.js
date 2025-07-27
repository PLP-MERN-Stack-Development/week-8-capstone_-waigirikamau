const express = require('express');
const Chat = require('../models/Chat');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const auth = require('../middleware/auth');

const router = express.Router();

// Create or get chat between farmer and buyer
router.post('/create', auth, async (req, res) => {
  try {
    const { farmerId, buyerId, productId } = req.body;

    // Validate that the user has permission to create this chat
    let userProfile;
    if (req.user.role === 'farmer') {
      userProfile = await Farmer.findOne({ userId: req.user.userId });
      if (!userProfile) {
        return res.status(400).json({ message: 'Farmer profile not found' });
      }
    } else if (req.user.role === 'buyer') {
      userProfile = await Buyer.findOne({ userId: req.user.userId });
      if (!userProfile) {
        return res.status(400).json({ message: 'Buyer profile not found' });
      }
    }

    // Check if chat already exists
    let chat = await Chat.findOne({ farmerId, buyerId })
      .populate('farmerId', 'farmName firstName lastName profileImage')
      .populate('buyerId', 'businessName firstName lastName profileImage');

    if (!chat) {
      chat = new Chat({
        farmerId,
        buyerId,
        productId: productId || null
      });
      await chat.save();
      await chat.populate('farmerId', 'farmName firstName lastName profileImage');
      await chat.populate('buyerId', 'businessName firstName lastName profileImage');
    }

    res.json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error creating chat' });
  }
});

// Get user's chats
router.get('/my-chats', auth, async (req, res) => {
  try {
    let chats;

    if (req.user.role === 'farmer') {
      const farmer = await Farmer.findOne({ userId: req.user.userId });
      if (!farmer) {
        return res.status(400).json({ message: 'Farmer profile not found' });
      }

      chats = await Chat.find({ farmerId: farmer._id })
        .populate('farmerId', 'farmName firstName lastName profileImage')
        .populate('buyerId', 'businessName firstName lastName profileImage')
        .populate('productId', 'name images')
        .sort({ 'lastMessage.timestamp': -1 });
    } else if (req.user.role === 'buyer') {
      const buyer = await Buyer.findOne({ userId: req.user.userId });
      if (!buyer) {
        return res.status(400).json({ message: 'Buyer profile not found' });
      }

      chats = await Chat.find({ buyerId: buyer._id })
        .populate('farmerId', 'farmName firstName lastName profileImage')
        .populate('buyerId', 'businessName firstName lastName profileImage')
        .populate('productId', 'name images')
        .sort({ 'lastMessage.timestamp': -1 });
    }

    res.json(chats || []);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('farmerId', 'farmName firstName lastName profileImage')
      .populate('buyerId', 'businessName firstName lastName profileImage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user has access to this chat
    if (req.user.role === 'farmer') {
      const farmer = await Farmer.findOne({ userId: req.user.userId });
      if (!farmer || farmer._id.toString() !== chat.farmerId._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'buyer') {
      const buyer = await Buyer.findOne({ userId: req.user.userId });
      if (!buyer || buyer._id.toString() !== chat.buyerId._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Get sender profile
    let senderId;
    if (req.user.role === 'farmer') {
      const farmer = await Farmer.findOne({ userId: req.user.userId });
      if (!farmer || farmer._id.toString() !== chat.farmerId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      senderId = farmer._id;
    } else if (req.user.role === 'buyer') {
      const buyer = await Buyer.findOne({ userId: req.user.userId });
      if (!buyer || buyer._id.toString() !== chat.buyerId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      senderId = buyer._id;
    }

    const message = {
      senderId,
      senderRole: req.user.role,
      content,
      timestamp: new Date()
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      timestamp: new Date(),
      senderRole: req.user.role
    };

    await chat.save();

    res.json({ message: 'Message sent successfully', messageData: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;