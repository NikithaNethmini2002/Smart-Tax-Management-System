const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Configure OpenAI API
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// Function to generate context about the Easy Tax application
const generateAppContext = () => {
  return `
    You are a helpful assistant for the Easy Tax application, which helps users manage their finances,
    track expenses, create budgets, and get financial reports. 
    
    Features of Easy Tax include:
    - Transaction tracking (income and expenses)
    - Budget creation and management
    - Financial reports and visualizations
    - Tax-related information and tips
    
    Provide helpful, concise, and friendly responses to user queries about taxes, budgeting, the platform, 
    and general financial advice. Keep responses brief but informative.
  `;
};

// Enhanced fallback responses for when OpenAI API is not available
const getFallbackResponse = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Check if user is asking what the chatbot can do or what they can ask
  if (lowercaseMessage.includes('what can i ask') || 
      lowercaseMessage.includes('what questions') || 
      lowercaseMessage.includes('what can you answer') || 
      lowercaseMessage.includes('what can you help') || 
      lowercaseMessage.includes('what can you do') ||
      lowercaseMessage.includes('what can you tell') ||
      lowercaseMessage.includes('what topics') ||
      lowercaseMessage.includes('help me with') ||
      (lowercaseMessage.includes('asked') && lowercaseMessage.includes('from you')) ||
      (lowercaseMessage.includes('example') && lowercaseMessage.includes('questions'))) {
      
    return `Here are some questions I can answer about Easy Tax and personal finance:

**App Navigation:**
- "How do I add a new transaction?"
- "How do I create or edit a budget?"
- "Where can I find financial reports?"
- "How do I update my profile or change my password?"

**Tax Questions:**
- "What are common tax deductions or credits?"
- "How can I maximize my tax refund?"
- "What are income tax rates?"
- "What tax considerations apply to self-employed people?"

**Budgeting Help:**
- "How do I set up budget notifications?"
- "What is the 50/30/20 budget rule?"
- "How can I get budget recommendations?"
- "How do I edit my existing budgets?"

**Transaction Management:**
- "How do I filter or categorize transactions?"
- "How can I track recurring expenses?"
- "How do I export my transaction data?"
- "How do I delete a transaction?"

**Financial Advice:**
- "How can I save money effectively?"
- "What's the best way to reduce debt?"
- "How do I build an emergency fund?"
- "How should I start investing?"
- "How can I improve my credit score?"

Feel free to ask about any of these topics or anything else related to your finances!`;
  }
  
  // TAX-RELATED QUESTIONS
  if (lowercaseMessage.includes('tax deduction') || lowercaseMessage.includes('tax deductions')) {
    return "Common tax deductions include mortgage interest, student loan interest, charitable donations, medical expenses, retirement contributions, and business expenses. The specific deductions available depend on your country and tax situation.";
  }
  
  if (lowercaseMessage.includes('tax credit') || lowercaseMessage.includes('tax credits')) {
    return "Common tax credits include child tax credits, education credits, earned income credit, and energy efficiency credits. Tax credits directly reduce your tax bill and are generally more valuable than deductions which only reduce taxable income.";
  }
  
  if (lowercaseMessage.includes('tax refund') || lowercaseMessage.includes('tax return')) {
    return "To maximize your tax refund, ensure you claim all eligible deductions and credits, contribute to tax-advantaged accounts like retirement plans, and keep organized records of all tax-related expenses throughout the year.";
  }
  
  if (lowercaseMessage.includes('income tax') && lowercaseMessage.includes('rate')) {
    return "Income tax rates vary by location and income level. Most countries use progressive tax systems where higher income is taxed at higher rates. Check your local tax authority for specific tax brackets applicable to your situation.";
  }
  
  if (lowercaseMessage.includes('self-employed') || lowercaseMessage.includes('freelance') || lowercaseMessage.includes('contractor')) {
    return "Self-employed individuals can typically deduct business expenses, home office costs, health insurance premiums, retirement plan contributions, and a portion of self-employment taxes. Make sure to set aside money for quarterly estimated tax payments.";
  }
  
  // BUDGET-RELATED QUESTIONS
  if (lowercaseMessage.includes('budget') && !lowercaseMessage.includes('rule') && !lowercaseMessage.includes('notification') && !lowercaseMessage.includes('recommend') && !lowercaseMessage.includes('suggestion') && !lowercaseMessage.includes('edit') && !lowercaseMessage.includes('update') && !lowercaseMessage.includes('create') && !lowercaseMessage.includes('new')) {
    return "Easy Tax helps you create and manage budgets to control your spending. You can set budgets by category (like food, housing, or entertainment) or for overall spending. Visit the Budgets section to create a new budget, view your existing budgets, or see how your spending compares to your budgets.";
  }
  
  if (lowercaseMessage.includes('budget') && (lowercaseMessage.includes('create') || lowercaseMessage.includes('new'))) {
    return "To create a budget, go to the Budgets section in the sidebar menu and click 'Create New Budget'. You can set an amount, select a period (weekly, monthly, yearly), and optionally assign it to a specific category.";
  }
  
  if (lowercaseMessage.includes('budget') && (lowercaseMessage.includes('edit') || lowercaseMessage.includes('update'))) {
    return "To edit an existing budget, go to the Budgets section, find the budget you want to modify, and click on the edit icon. You can adjust the amount, period, or category as needed.";
  }
  
  if (lowercaseMessage.includes('budget') && lowercaseMessage.includes('notification')) {
    return "Budget notifications alert you when your spending reaches a certain percentage of your budget. You can customize the notification threshold when creating or editing a budget (default is 80%).";
  }
  
  if (lowercaseMessage.includes('budget') && (lowercaseMessage.includes('recommend') || lowercaseMessage.includes('suggestion'))) {
    return "For budget recommendations, go to the Budgets section and click on 'Budget Recommendations'. The system analyzes your spending patterns and suggests appropriate budget amounts for different categories.";
  }
  
  if (lowercaseMessage.includes('50/30/20') || lowercaseMessage.includes('budget rule')) {
    return "The 50/30/20 budget rule suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. This is a helpful starting point for creating a balanced budget.";
  }
  
  // TRANSACTION-RELATED QUESTIONS
  if (lowercaseMessage.includes('transaction') && (lowercaseMessage.includes('add') || lowercaseMessage.includes('new'))) {
    return "To add a new transaction, navigate to the Transactions section from the sidebar menu and click the '+ New Transaction' button. Fill in the type (income or expense), amount, date, category, and optional description.";
  }
  
  if (lowercaseMessage.includes('transaction') && (lowercaseMessage.includes('edit') || lowercaseMessage.includes('update'))) {
    return "To edit a transaction, go to the Transactions section, find the transaction you want to modify, and click on the edit icon. You can change any details as needed.";
  }
  
  if (lowercaseMessage.includes('transaction') && lowercaseMessage.includes('delete')) {
    return "To delete a transaction, go to the Transactions section, find the transaction you want to remove, and click on the delete icon. You'll be asked to confirm the deletion.";
  }
  
  if (lowercaseMessage.includes('transaction') && lowercaseMessage.includes('filter')) {
    return "You can filter transactions by date range, category, type (income/expense), or amount. Use the filter options at the top of the Transactions page to narrow down the displayed transactions.";
  }
  
  if (lowercaseMessage.includes('transaction') && lowercaseMessage.includes('category')) {
    return "Transaction categories help organize your finances. Choose from predefined categories like 'Food & Dining', 'Housing', 'Transportation', etc., or create custom categories that match your specific needs.";
  }
  
  if (lowercaseMessage.includes('recurring') || lowercaseMessage.includes('subscription')) {
    return "To track recurring expenses or subscriptions, add them as transactions and tag them as 'recurring'. This helps identify regular payments and analyze your fixed expenses over time.";
  }
  
  // REPORT-RELATED QUESTIONS
  if (lowercaseMessage.includes('report') || lowercaseMessage.includes('analytics') || lowercaseMessage.includes('chart')) {
    return "You can view your financial reports in the Financial Reports section. There you'll find spending trends, income vs expenses comparison, category breakdowns, and a financial summary to help track your financial progress.";
  }
  
  if (lowercaseMessage.includes('spending trend') || lowercaseMessage.includes('spending pattern')) {
    return "The Spending Trends report shows your expense patterns over time. This helps identify spending increases or decreases across weeks, months, or years, allowing you to spot seasonal variations and long-term trends.";
  }
  
  if (lowercaseMessage.includes('income') && lowercaseMessage.includes('expense') && (lowercaseMessage.includes('compare') || lowercaseMessage.includes('comparison'))) {
    return "The Income vs Expense report compares your earnings against your spending for selected time periods. This helps you understand if you're consistently saving money or living beyond your means.";
  }
  
  if (lowercaseMessage.includes('category breakdown') || lowercaseMessage.includes('spending by category')) {
    return "The Category Breakdown report shows how your spending is distributed across different categories. This helps identify areas where you might be overspending and opportunities to adjust your budget.";
  }
  
  if (lowercaseMessage.includes('financial summary') || lowercaseMessage.includes('dashboard')) {
    return "The Financial Summary provides a high-level overview of your finances, including total income, total expenses, balance, and savings rate for the selected period, compared to the previous period.";
  }
  
  if (lowercaseMessage.includes('export') && (lowercaseMessage.includes('report') || lowercaseMessage.includes('data'))) {
    return "You can export your financial data or reports by clicking the export button in the relevant section. Reports can be downloaded in common formats like PDF or CSV for further analysis or record-keeping.";
  }
  
  // ACCOUNT & PROFILE QUESTIONS
  if (lowercaseMessage.includes('profile') && (lowercaseMessage.includes('update') || lowercaseMessage.includes('edit'))) {
    return "To update your profile information, click on 'Profile' in the sidebar menu. You can edit your personal details there and save your changes.";
  }
  
  if (lowercaseMessage.includes('password') && (lowercaseMessage.includes('change') || lowercaseMessage.includes('reset'))) {
    return "To change your password, select 'Change Password' from the sidebar menu. You'll need to enter your current password and then your new password twice to confirm.";
  }
  
  if (lowercaseMessage.includes('account') && lowercaseMessage.includes('delete')) {
    return "To delete your account, go to your Profile settings and select the account deletion option. Please note that this action is permanent and will remove all your data from the system.";
  }
  
  if (lowercaseMessage.includes('data backup') || lowercaseMessage.includes('backup data')) {
    return "It's recommended to regularly export your transaction data as a backup. Go to the Transactions section and use the export function to download your data in CSV format.";
  }
  
  if (lowercaseMessage.includes('logout') || lowercaseMessage.includes('sign out')) {
    return "To log out of your account, click on the Logout button in the top right corner of the application or select Logout from the sidebar menu.";
  }
  
  // GENERAL FINANCE ADVICE
  if (lowercaseMessage.includes('saving') || lowercaseMessage.includes('save money')) {
    return "To save money effectively, try the following: create and stick to a budget, track all expenses, reduce unnecessary subscriptions, automate savings transfers, use cashback or rewards programs, and consider shopping with a list to avoid impulse purchases.";
  }
  
  if (lowercaseMessage.includes('debt') && (lowercaseMessage.includes('reduce') || lowercaseMessage.includes('pay off'))) {
    return "To reduce debt, consider using either the avalanche method (paying off highest interest rate debt first) or the snowball method (paying off smallest balances first). Also, try consolidating high-interest debt, negotiating lower rates, and avoiding new debt while paying off existing obligations.";
  }
  
  if (lowercaseMessage.includes('emergency fund') || lowercaseMessage.includes('rainy day fund')) {
    return "An emergency fund should ideally cover 3-6 months of expenses. Start small if necessary and gradually build it up. Keep these funds in an accessible but separate account to avoid the temptation of spending it on non-emergencies.";
  }
  
  if (lowercaseMessage.includes('invest') || lowercaseMessage.includes('investment')) {
    return "For beginning investors, consider starting with tax-advantaged retirement accounts, low-cost index funds, or robo-advisors. Diversification, long-term thinking, and regular contributions are key principles for investment success.";
  }
  
  if (lowercaseMessage.includes('retirement') || lowercaseMessage.includes('retire')) {
    return "For retirement planning, start saving early to benefit from compound interest. Contribute to tax-advantaged accounts like 401(k)s or IRAs, aim to save 10-15% of your income for retirement, and adjust your strategy as you get closer to retirement age.";
  }
  
  if (lowercaseMessage.includes('credit score') || lowercaseMessage.includes('credit rating')) {
    return "To improve your credit score: pay bills on time, reduce credit card balances, avoid opening too many new accounts, keep old accounts open, use different types of credit, and regularly check your credit report for errors.";
  }
  
  // FEATURE & GETTING STARTED QUESTIONS
  if ((lowercaseMessage.includes('get started') || lowercaseMessage.includes('begin') || lowercaseMessage.includes('tutorial')) && lowercaseMessage.includes('easy tax')) {
    return "To get started with Easy Tax, first add your income and expense transactions to build your financial history. Then set up budgets to manage your spending, and use the Financial Reports to gain insights into your financial patterns.";
  }
  
  if (lowercaseMessage.includes('feature') || lowercaseMessage.includes('what can you do')) {
    return "Easy Tax helps you track income and expenses, create and manage budgets, generate financial reports (spending trends, income vs expense, category breakdowns), get financial insights, and access tax-related information.";
  }
  
  if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
    return "Hello! I'm your Easy Tax assistant. I can help you with managing transactions, creating budgets, understanding financial reports, and providing tax and finance advice. What would you like help with today?";
  }
  
  if (lowercaseMessage.includes('thank you') || lowercaseMessage.includes('thanks')) {
    return "You're welcome! If you have any other questions about Easy Tax or your finances, feel free to ask anytime.";
  }
  
  // Default response
  return "I'm here to help with questions about using Easy Tax, budgeting, transactions, financial reports, and general tax advice. You can ask me specific questions like 'How do I create a budget?' or 'What are common tax deductions?' or type 'What can you help with?' to see a list of topics I can assist with.";
};

/**
 * @desc    Process user message and generate chatbot response
 * @route   POST /api/chatbot/message
 * @access  Private (requires authentication)
 */
exports.processChatMessage = async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Check if OpenAI API is available
    if (!openai) {
      console.log('Using fallback response system as OpenAI API is not configured');
      const fallbackResponse = getFallbackResponse(message);
      
      return res.json({
        response: fallbackResponse,
        timestamp: new Date(),
        source: 'fallback'
      });
    }
    
    // Prepare conversation history for context
    // Keep only the last 10 messages to avoid token limits
    const recentConversation = conversation.slice(-10);
    
    // Format messages for OpenAI API
    const messages = [
      { role: 'system', content: generateAppContext() },
      ...recentConversation.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];
    
    // Log the conversation for debugging (remove in production)
    console.log('Sending conversation to OpenAI:', JSON.stringify(messages, null, 2));
    
    try {
      // Call OpenAI API with v4 syntax
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });
      
      // Extract the response
      const botResponse = completion.choices[0].message.content.trim();
      
      // Return the response
      res.json({
        response: botResponse,
        timestamp: new Date(),
        source: 'openai'
      });
    } catch (apiError) {
      console.error('OpenAI API Error:', apiError);
      
      // Fallback to static responses if API call fails
      const fallbackResponse = getFallbackResponse(message);
      
      res.json({
        response: fallbackResponse,
        timestamp: new Date(),
        source: 'fallback'
      });
    }
    
  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Handle platform-specific questions with pre-defined responses
 * @route   GET /api/chatbot/faq
 * @access  Private
 */
exports.getFrequentlyAskedQuestions = async (req, res) => {
  try {
    const faqs = [
      // App Usage
      {
        question: "How do I add a new transaction?",
        answer: "To add a new transaction, go to Transactions in the sidebar menu and click the '+ New Transaction' button. Fill in the details and click Save.",
        category: "App Usage"
      },
      {
        question: "How do I create a budget?",
        answer: "To create a budget, navigate to Budgets in the sidebar menu and click 'Create New Budget'. Set your budget amount, period, and optional category.",
        category: "App Usage"
      },
      {
        question: "Where can I see my financial reports?",
        answer: "Your financial reports are available under 'Financial Reports' in the sidebar menu. There you can view spending trends, income vs expenses, and category breakdowns.",
        category: "App Usage"
      },
      {
        question: "How do I update my profile?",
        answer: "To update your profile, click on 'Profile' in the sidebar menu. You can edit your information there.",
        category: "App Usage"
      },
      {
        question: "How do I edit a transaction?",
        answer: "To edit a transaction, go to the Transactions section, find the transaction you want to modify, and click on the edit icon. You can change any details as needed.",
        category: "App Usage"
      },
      {
        question: "How do I delete a transaction?",
        answer: "To delete a transaction, go to the Transactions section, find the transaction you want to remove, and click on the delete icon. You'll be asked to confirm the deletion.",
        category: "App Usage"
      },
      
      // Tax Questions
      {
        question: "What are common tax deductions?",
        answer: "Common tax deductions include mortgage interest, charitable donations, medical expenses, retirement contributions, and business expenses. The specific deductions available depend on your country and tax situation.",
        category: "Taxes"
      },
      {
        question: "How do tax credits differ from deductions?",
        answer: "Tax credits directly reduce your tax bill dollar-for-dollar, while deductions only reduce your taxable income. This makes credits generally more valuable than deductions of the same amount.",
        category: "Taxes"
      },
      {
        question: "How can I maximize my tax refund?",
        answer: "To maximize your tax refund, ensure you claim all eligible deductions and credits, contribute to tax-advantaged accounts like retirement plans, and keep organized records of all tax-related expenses throughout the year.",
        category: "Taxes"
      },
      {
        question: "What tax considerations apply to self-employed people?",
        answer: "Self-employed individuals can typically deduct business expenses, home office costs, health insurance premiums, retirement plan contributions, and a portion of self-employment taxes. Make sure to set aside money for quarterly estimated tax payments.",
        category: "Taxes"
      },
      {
        question: "What are income tax brackets?",
        answer: "Income tax brackets determine the tax rate applied to different portions of your income. Most countries use progressive tax systems where higher income is taxed at higher rates. Check your local tax authority for specific tax brackets applicable to your situation.",
        category: "Taxes"
      },
      
      // Financial Advice
      {
        question: "How can I save money?",
        answer: "To save money effectively, create and stick to a budget, track all expenses, reduce unnecessary subscriptions, automate savings transfers, and avoid impulse purchases.",
        category: "Financial Advice"
      },
      {
        question: "What is the 50/30/20 budget rule?",
        answer: "The 50/30/20 budget rule suggests allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.",
        category: "Financial Advice"
      },
      {
        question: "How should I start investing?",
        answer: "For beginning investors, consider starting with tax-advantaged retirement accounts, low-cost index funds, or robo-advisors.",
        category: "Financial Advice"
      },
      {
        question: "How do I build an emergency fund?",
        answer: "An emergency fund should cover 3-6 months of expenses. Start by setting a small monthly savings goal, automate your contributions, and keep the money in a separate, accessible account.",
        category: "Financial Advice"
      },
      {
        question: "What's the best way to reduce debt?",
        answer: "To reduce debt, consider using either the avalanche method (paying off highest interest rate debt first) or the snowball method (paying off smallest balances first). Also, try consolidating high-interest debt, negotiating lower rates, and avoiding new debt while paying off existing obligations.",
        category: "Financial Advice"
      },
      {
        question: "How can I improve my credit score?",
        answer: "To improve your credit score: pay bills on time, reduce credit card balances, avoid opening too many new accounts, keep old accounts open, use different types of credit, and regularly check your credit report for errors.",
        category: "Financial Advice"
      },
      
      // Budget Management
      {
        question: "How do I set up budget notifications?",
        answer: "Budget notifications alert you when your spending reaches a certain percentage of your budget. You can customize the notification threshold when creating or editing a budget (default is 80%).",
        category: "Budget Management"
      },
      {
        question: "How do I edit an existing budget?",
        answer: "To edit an existing budget, go to the Budgets section, find the budget you want to modify, and click on the edit icon. You can adjust the amount, period, or category as needed.",
        category: "Budget Management"
      },
      {
        question: "How can I get budget recommendations?",
        answer: "For budget recommendations, go to the Budgets section and click on 'Budget Recommendations'. The system analyzes your spending patterns and suggests appropriate budget amounts for different categories.",
        category: "Budget Management"
      },
      {
        question: "What budgeting method is best for beginners?",
        answer: "For beginners, the 50/30/20 rule is a simple and effective budgeting method. Allocate 50% of your income to necessities, 30% to wants, and 20% to savings and debt repayment. Easy Tax helps you track these categories automatically.",
        category: "Budget Management"
      },
      {
        question: "How often should I review my budget?",
        answer: "It's recommended to review your budget monthly to track your progress and make necessary adjustments. Easy Tax provides monthly summaries to help with this review process.",
        category: "Budget Management"
      },
      
      // Transaction Management
      {
        question: "How do I export my transaction data?",
        answer: "Go to the Transactions section and use the export function to download your data in CSV format for backup or analysis.",
        category: "Transaction Management"
      },
      {
        question: "How do I filter my transactions?",
        answer: "Use the filter options at the top of the Transactions page to filter by date range, category, type (income/expense), or amount.",
        category: "Transaction Management"
      },
      {
        question: "How do I categorize my transactions?",
        answer: "When creating or editing a transaction, select a category from the dropdown menu. You can choose from predefined categories like 'Food & Dining', 'Housing', 'Transportation', etc., or create custom categories that match your specific needs.",
        category: "Transaction Management"
      },
      {
        question: "How do I track recurring expenses?",
        answer: "To track recurring expenses or subscriptions, add them as transactions and tag them as 'recurring'. This helps identify regular payments and analyze your fixed expenses over time.",
        category: "Transaction Management"
      },
      {
        question: "Can I import transactions from my bank?",
        answer: "Currently, you need to enter transactions manually. However, you can export your bank statements as CSV files and then format them for bulk import into Easy Tax.",
        category: "Transaction Management"
      },
      
      // Reports and Analytics
      {
        question: "What is the Spending Trends report?",
        answer: "The Spending Trends report shows your expense patterns over time. This helps identify spending increases or decreases across weeks, months, or years, allowing you to spot seasonal variations and long-term trends.",
        category: "Reports and Analytics"
      },
      {
        question: "What does the Income vs Expense report show?",
        answer: "The Income vs Expense report compares your earnings against your spending for selected time periods. This helps you understand if you're consistently saving money or living beyond your means.",
        category: "Reports and Analytics"
      },
      {
        question: "How do I use the Category Breakdown report?",
        answer: "The Category Breakdown report shows how your spending is distributed across different categories. This helps identify areas where you might be overspending and opportunities to adjust your budget.",
        category: "Reports and Analytics"
      },
      {
        question: "What time periods can I analyze in reports?",
        answer: "You can analyze your finances over various time periods including weekly, monthly, quarterly, and yearly views. Use the date filters in the reports section to customize the time range.",
        category: "Reports and Analytics"
      },
      {
        question: "How do I export financial reports?",
        answer: "You can export your financial reports by clicking the export button in the relevant report section. Reports can be downloaded in common formats like PDF or CSV for further analysis or record-keeping.",
        category: "Reports and Analytics"
      },
      
      // Account Management
      {
        question: "How do I change my password?",
        answer: "To change your password, select 'Change Password' from the sidebar menu. You'll need to enter your current password and then your new password twice to confirm.",
        category: "Account Management"
      },
      {
        question: "How do I back up my data?",
        answer: "It's recommended to regularly export your transaction data as a backup. Go to the Transactions section and use the export function to download your data in CSV format.",
        category: "Account Management"
      },
      {
        question: "How do I delete my account?",
        answer: "To delete your account, go to your Profile settings and select the account deletion option. Please note that this action is permanent and will remove all your data from the system.",
        category: "Account Management"
      },
      {
        question: "How do I log out?",
        answer: "To log out of your account, click on the Logout button in the top right corner of the application or select Logout from the sidebar menu.",
        category: "Account Management"
      },
      {
        question: "Is my financial data secure?",
        answer: "Yes, Easy Tax uses encryption and secure authentication to protect your financial data. We never share your information with third parties without your explicit consent.",
        category: "Account Management"
      }
    ];
    
    res.json(faqs);
  } catch (error) {
    console.error('FAQ Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 