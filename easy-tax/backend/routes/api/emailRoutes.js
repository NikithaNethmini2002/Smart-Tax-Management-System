const express = require('express');
const router = express.Router();
const emailService = require('../../services/emailService');

// @route   POST api/email/send-reminder
// @desc    Send a tax reminder email
// @access  Public (in a real app, you'd add authorization)
router.post('/send-reminder', async (req, res) => {
  try {
    const {
      to,
      toName,
      salaryTax,
      businessTax,
      totalTax,
      monthYear
    } = req.body;
    
    // Validate email
    if (!to || !validateEmail(to)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid recipient email is required' 
      });
    }
    
    // Send the email
    const result = await emailService.sendTaxReminder({
      to,
      toName: toName || to.split('@')[0], // Use part before @ if no name provided
      salaryTax,
      businessTax,
      totalTax,
      monthYear
    });
    
    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        messageId: result.messageId,
        message: 'Email sent successfully'
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in send-reminder route:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error'
    });
  }
});

// Helper function to validate email
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

module.exports = router; 