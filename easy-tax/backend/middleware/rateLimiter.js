const rateLimit = require('express-rate-limit');

// Rate limiter for chatbot API to prevent abuse
const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 50 to 200 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting in development environment or if running locally
    return process.env.NODE_ENV === 'development' || 
           req.ip === '127.0.0.1' || 
           req.ip === '::1' || 
           req.ip.includes('192.168.');
  }
});

module.exports = {
  chatbotLimiter
}; 