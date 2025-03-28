import TransactionService from './transaction.service';

/**
 * Service for automatically creating tax expense transactions based on calculated taxes
 */
class TaxExpenseService {
  // Track if a tax expense is currently being created to prevent race conditions
  static isCreatingExpense = false;
  static isUpdatingExpense = false;

  /**
   * Create a tax expense transaction based on calculated tax amounts
   * @param {number} totalTaxAmount - The total tax amount to create an expense for
   * @param {string} taxDescription - Description of the tax (e.g., "Monthly Tax Payment")
   * @param {Date} date - The date for the transaction (defaults to today)
   * @returns {Promise} - Promise that resolves with the created transaction
   */
  static async createTaxExpenseTransaction(totalTaxAmount, taxDescription = 'Tax Payment', date = new Date()) {
    // Prevent concurrent creation attempts
    if (TaxExpenseService.isCreatingExpense) {
      console.log('Tax expense creation already in progress, skipping');
      return null;
    }

    TaxExpenseService.isCreatingExpense = true;

    try {
      // Find existing expense for the month
      const existingExpense = await TaxExpenseService.findExistingTaxTransaction(date);
      
      // If expense exists, update it instead of creating a new one
      if (existingExpense) {
        console.log('Tax expense already exists for this month, updating amount');
        TaxExpenseService.isCreatingExpense = false;
        return await TaxExpenseService.updateTaxExpenseAmount(existingExpense, totalTaxAmount);
      }

      // Create transaction data for the tax expense
      const transactionData = {
        type: 'expense',
        amount: totalTaxAmount,
        date: date,
        category: 'Taxes',
        description: taxDescription,
        tags: ['#tax', '#automatic'],
        paymentMethod: 'bank transfer' // Default payment method
      };

      // Create the transaction
      const createdTransaction = await TransactionService.createTransaction(transactionData);
      console.log('Tax expense transaction created automatically:', createdTransaction);
      
      // Reset the creation lock after a short delay to ensure any race condition is avoided
      setTimeout(() => {
        TaxExpenseService.isCreatingExpense = false;
      }, 1000);
      
      return createdTransaction;
    } catch (error) {
      console.error('Failed to create tax expense transaction:', error);
      TaxExpenseService.isCreatingExpense = false;
      throw error;
    }
  }

  /**
   * Update the amount of an existing tax expense transaction
   * @param {Object} existingTransaction - The existing transaction to update
   * @param {number} newAmount - The new amount for the transaction
   * @returns {Promise} - Promise that resolves with the updated transaction
   */
  static async updateTaxExpenseAmount(existingTransaction, newAmount) {
    // Prevent concurrent update attempts
    if (TaxExpenseService.isUpdatingExpense) {
      console.log('Tax expense update already in progress, skipping');
      return null;
    }

    TaxExpenseService.isUpdatingExpense = true;

    try {
      // Only update if amount has actually changed
      if (existingTransaction.amount === newAmount) {
        console.log('Tax expense amount unchanged, skipping update');
        TaxExpenseService.isUpdatingExpense = false;
        return existingTransaction;
      }

      // Create updated transaction data
      const updatedTransactionData = {
        ...existingTransaction,
        amount: newAmount
      };

      // Update the transaction
      const updatedTransaction = await TransactionService.updateTransaction(
        existingTransaction._id, 
        updatedTransactionData
      );
      
      console.log(`Tax expense amount updated from ${existingTransaction.amount} to ${newAmount}`);
      
      // Reset the update lock after a delay
      setTimeout(() => {
        TaxExpenseService.isUpdatingExpense = false;
      }, 1000);
      
      return updatedTransaction;
    } catch (error) {
      console.error('Failed to update tax expense amount:', error);
      TaxExpenseService.isUpdatingExpense = false;
      throw error;
    }
  }

  /**
   * Update tax expense for the current month based on a new total tax amount
   * @param {number} newTotalTaxAmount - The new total tax amount
   * @returns {Promise} - Promise that resolves with the updated transaction or null
   */
  static async updateCurrentMonthTaxExpense(newTotalTaxAmount) {
    try {
      const today = new Date();
      
      // Find existing expense for the month
      const existingExpense = await TaxExpenseService.findExistingTaxTransaction(today);
      
      // If tax amount is zero or negative and there's an existing expense, delete it
      if (newTotalTaxAmount <= 0 && existingExpense) {
        console.log('Tax amount is zero or negative, removing existing tax expense');
        await TransactionService.deleteTransaction(existingExpense._id);
        return null;
      } else if (existingExpense) {
        // Update existing expense
        return await TaxExpenseService.updateTaxExpenseAmount(existingExpense, newTotalTaxAmount);
      } else if (newTotalTaxAmount > 0) {
        // Create new expense if none exists and amount is positive
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        const description = `Automatic Tax Payment - ${month} ${year}`;
        
        return await TaxExpenseService.createTaxExpenseTransaction(
          newTotalTaxAmount, 
          description, 
          today
        );
      }
      
      return null;
    } catch (error) {
      console.error('Error updating current month tax expense:', error);
      return null;
    }
  }

  /**
   * Find an existing tax expense transaction for the given month
   * @param {Date} date - The date to check for existing tax transactions
   * @returns {Promise<Object|null>} - Returns the transaction object or null if not found
   */
  static async findExistingTaxTransaction(date) {
    try {
      // Get all transactions to avoid filtering issues on the backend
      const allTransactions = await TransactionService.getAllTransactions();
      
      if (!allTransactions || !Array.isArray(allTransactions)) {
        console.error('Invalid transaction data received');
        return null;
      }
      
      // Get start and end of month
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Filter transactions client-side to ensure accuracy
      const existingTaxes = allTransactions.filter(tx => {
        // Skip if not a tax expense
        if (tx.category !== 'Taxes' || tx.type !== 'expense') {
          return false;
        }
        
        // Check for automatic tag
        const hasTaxTag = tx.tags && 
          Array.isArray(tx.tags) && 
          (tx.tags.includes('#automatic') || tx.tags.includes('#tax'));
        
        if (!hasTaxTag) {
          return false;
        }
        
        // Check date range
        const txDate = new Date(tx.date);
        const inDateRange = txDate >= startDate && txDate <= endDate;
        
        return inDateRange;
      });
      
      // Log for debugging
      if (existingTaxes.length > 0) {
        console.log(`Found ${existingTaxes.length} existing tax expenses for this month:`, existingTaxes);
        // Return the first matching transaction
        return existingTaxes[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error finding existing tax transaction:', error);
      return null;
    }
  }

  /**
   * Check if a tax expense transaction already exists for the given month
   * @param {Date} date - The date to check for existing tax transactions
   * @returns {Promise<boolean>} - True if a tax transaction already exists for the month
   */
  static async checkExistingTaxTransaction(date) {
    const existingTransaction = await TaxExpenseService.findExistingTaxTransaction(date);
    return existingTransaction !== null;
  }

  /**
   * Delete tax expense transaction for the current month
   * Called when all taxes are deleted
   * @param {Date} date - The date to find and delete tax transactions (defaults to today)
   * @returns {Promise<boolean>} - True if a transaction was deleted, false otherwise
   */
  static async removeTaxExpenseTransaction(date = new Date()) {
    try {
      // Find existing expense for the month
      const existingExpense = await TaxExpenseService.findExistingTaxTransaction(date);
      
      if (existingExpense && existingExpense._id) {
        // Delete the transaction
        await TransactionService.deleteTransaction(existingExpense._id);
        console.log('Tax expense transaction deleted:', existingExpense._id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing tax expense transaction:', error);
      return false;
    }
  }

  /**
   * Clear any pending expense creation locks (useful for component unmount)
   */
  static resetCreationLock() {
    TaxExpenseService.isCreatingExpense = false;
    TaxExpenseService.isUpdatingExpense = false;
  }
}

export default TaxExpenseService; 