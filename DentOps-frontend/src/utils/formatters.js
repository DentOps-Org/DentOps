/**
 * FORMATTING UTILITIES
 * 
 * Common formatting functions used throughout the app.
 * These are pure functions - perfect for unit testing!
 */

/**
 * Format a date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date like "December 15, 2024"
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted like "$100.00"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Get color for appointment status
 * @param {string} status - Appointment status
 * @returns {string} - Tailwind color class
 */
export function getStatusColor(status) {
  const colors = {
    PENDING: 'yellow',
    CONFIRMED: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red'
  };
  
  return colors[status] || 'gray';
}
