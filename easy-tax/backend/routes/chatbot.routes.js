const express = require('express');
const chatbotController = require('../controllers/chatbot.controller');
const { authenticateUser } = require('../middleware/auth');
const { chatbotLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply authentication middleware to all chatbot routes
router.use(authenticateUser);

// Apply rate limiting to all chatbot routes
router.use(chatbotLimiter);

// @route   POST api/chatbot/message
// @desc    Process user message and generate chatbot response
// @access  Private
router.post('/message', chatbotController.processChatMessage);

// @route   GET api/chatbot/faq
// @desc    Get frequently asked questions and answers
// @access  Private
router.get('/faq', chatbotController.getFrequentlyAskedQuestions);

module.exports = router; 