import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  Zoom,
  CircularProgress,
  Chip,
  Drawer,
  AppBar,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import chatbotService from '../../services/chatbot.service';
import ChatMessage from './ChatMessage';

const Chatbot = () => {
  // State variables
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch FAQs on component mount
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await chatbotService.getFrequentlyAskedQuestions();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFaqs();
  }, []);

  // Add welcome message when chat opens
  useEffect(() => {
    if (open && conversation.length === 0) {
      setConversation([
        {
          text: "Hello! I'm your Easy Tax assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, conversation.length]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to conversation
    const userMessage = {
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      // Prepare conversation history for the API
      const conversationHistory = conversation.map((msg) => ({
        text: msg.text,
        isUser: msg.isUser,
      }));

      // Send message to chatbot API
      const response = await chatbotService.sendMessage(
        userMessage.text,
        conversationHistory
      );

      // Add bot response to conversation
      const botMessage = {
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setConversation((prev) => [...prev, botMessage]);
      
      // Re-enable suggestions after bot responds
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting response from chatbot:', error);
      
      // Add error message to conversation
      const errorMessage = {
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setConversation((prev) => [...prev, errorMessage]);
      
      // Also show suggestions on error
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle pressing Enter to send a message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clicking on a suggested question
  const handleSuggestionClick = (question) => {
    setMessage(question);
    // Wait for state update before sending
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Toggle the chatbot open/closed
  const toggleChatbot = () => {
    setOpen((prev) => !prev);
  };
  
  // Get FAQs that the chatbot can definitely answer based on our fallback response system
  const getAnswerableFaqs = () => {
    if (!faqs || faqs.length === 0) return [];
    
    // Define patterns that match what the getFallbackResponse function can handle
    const answerablePatterns = [
      // Tax-related questions
      { pattern: /tax deduction/i, category: 'Taxes' },
      { pattern: /tax credit/i, category: 'Taxes' },
      { pattern: /tax refund|tax return/i, category: 'Taxes' },
      { pattern: /income tax.*rate/i, category: 'Taxes' },
      { pattern: /self-employed|freelance|contractor/i, category: 'Taxes' },
      
      // Budget-related questions
      { pattern: /create budget|new budget/i, category: 'Budget Management' },
      { pattern: /edit budget|update budget/i, category: 'Budget Management' },
      { pattern: /budget notification/i, category: 'Budget Management' },
      { pattern: /budget recommend|budget suggestion/i, category: 'Budget Management' },
      { pattern: /50\/30\/20|budget rule/i, category: 'Budget Management' },
      
      // Transaction-related questions
      { pattern: /add transaction|new transaction/i, category: 'App Usage' },
      { pattern: /edit transaction|update transaction/i, category: 'App Usage' },
      { pattern: /delete transaction/i, category: 'App Usage' },
      { pattern: /filter transaction/i, category: 'Transaction Management' },
      { pattern: /transaction category/i, category: 'Transaction Management' },
      { pattern: /recurring|subscription/i, category: 'Transaction Management' },
      
      // Report-related questions
      { pattern: /spending trend|spending pattern/i, category: 'Reports and Analytics' },
      { pattern: /income.*expense.*compare|income.*expense.*comparison/i, category: 'Reports and Analytics' },
      { pattern: /category breakdown|spending by category/i, category: 'Reports and Analytics' },
      { pattern: /financial summary|dashboard/i, category: 'Reports and Analytics' },
      { pattern: /export.*report|export.*data/i, category: 'Reports and Analytics' },
      
      // Account & profile questions
      { pattern: /profile.*update|profile.*edit/i, category: 'Account Management' },
      { pattern: /password.*change|password.*reset/i, category: 'Account Management' },
      { pattern: /account.*delete/i, category: 'Account Management' },
      { pattern: /data backup|backup data/i, category: 'Account Management' },
      { pattern: /logout|sign out/i, category: 'Account Management' },
      
      // Financial advice
      { pattern: /saving|save money/i, category: 'Financial Advice' },
      { pattern: /debt.*reduce|debt.*pay off/i, category: 'Financial Advice' },
      { pattern: /emergency fund|rainy day fund/i, category: 'Financial Advice' },
      { pattern: /invest|investment/i, category: 'Financial Advice' },
      { pattern: /credit score|credit rating/i, category: 'Financial Advice' },
      { pattern: /retirement|retire/i, category: 'Financial Advice' },
      
      // Feature & getting started
      { pattern: /(get started|begin|tutorial).*easy tax/i, category: 'App Usage' }
    ];
    
    // Filter FAQs to only include questions that match our answerable patterns
    return faqs.filter(faq => {
      const question = faq.question.toLowerCase();
      
      return answerablePatterns.some(pattern => {
        return pattern.pattern.test(question) && 
               (!pattern.category || pattern.category === faq.category);
      });
    });
  };
  
  // Get a subset of random FAQs to show as suggestions
  const getRandomSuggestions = () => {
    // Get only FAQs that the chatbot can definitely answer
    const answerableFaqs = getAnswerableFaqs();
    
    if (answerableFaqs.length === 0) return [];
    
    // Display up to 5 random answerable FAQs as suggestions
    const allFaqs = [...answerableFaqs];
    const maxSuggestions = Math.min(5, allFaqs.length);
    const suggestions = [];
    
    for (let i = 0; i < maxSuggestions; i++) {
      const randomIndex = Math.floor(Math.random() * allFaqs.length);
      suggestions.push(allFaqs[randomIndex]);
      allFaqs.splice(randomIndex, 1);
    }
    
    return suggestions;
  };

  return (
    <>
      {/* Floating button to open chatbot */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          aria-label="chatbot"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: 3,
          }}
          onClick={toggleChatbot}
        >
          <BotIcon />
        </Fab>
      </Zoom>

      {/* Chatbot drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleChatbot}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            height: { xs: '100%', sm: 'calc(100% - 48px)' },
            maxHeight: { xs: '100%', sm: 'calc(100% - 48px)' },
            bottom: { xs: 0, sm: 24 },
            right: { xs: 0, sm: 24 },
            borderRadius: { xs: 0, sm: 2 },
            boxShadow: 4,
            overflow: 'hidden',
          },
        }}
      >
        {/* Chatbot header */}
        <AppBar position="static" color="primary">
          <Toolbar variant="dense">
            <BotIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Easy Tax Assistant
            </Typography>
            <Tooltip title="Close">
              <IconButton
                edge="end"
                color="inherit"
                onClick={toggleChatbot}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Chat messages area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            height: 'calc(100% - 112px)',
            bgcolor: 'background.default',
          }}
        >
          {/* Messages */}
          {conversation.map((msg, index) => (
            <ChatMessage key={index} message={msg} isUser={msg.isUser} />
          ))}

          {/* Loading indicator */}
          {loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 2,
                ml: 5,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Suggested questions - Show after each bot response */}
          {showSuggestions && faqs.length > 0 && !loading && conversation.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                You can ask me:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getRandomSuggestions().map((faq, index) => (
                  <Chip
                    key={index}
                    label={faq.question}
                    onClick={() => handleSuggestionClick(faq.question)}
                    color="primary"
                    variant="outlined"
                    clickable
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message input area */}
        <Paper
          elevation={3}
          component="form"
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            autoComplete="off"
            autoFocus={open}
          />
          <IconButton
            color="primary"
            disabled={!message.trim() || loading}
            onClick={handleSendMessage}
            edge="end"
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </Drawer>
    </>
  );
};

export default Chatbot; 