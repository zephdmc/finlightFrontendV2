/**
 * Formatters Utility
 * Provides reusable formatting functions for dates, currency, numbers, etc.
 */

/**
 * Format currency in Nigerian Naira
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
    if (amount === undefined || amount === null) return showSymbol ? '₦0.00' : '0.00';
    
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
  };
  
  /**
   * Format number with commas
   * @param {number} number - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted number
   */
  export const formatNumber = (number, decimals = 0) => {
    if (number === undefined || number === null) return '0';
    
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  };
  
  /**
   * Format percentage
   * @param {number} value - Value to format as percentage
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted percentage
   */
  export const formatPercentage = (value, decimals = 1) => {
    if (value === undefined || value === null) return '0%';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  };
  
  /**
   * Format date
   * @param {string|Date} date - Date to format
   * @param {string} format - Format type (short, medium, long, full)
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date, format = 'medium') => {
    if (!date) return 'N/A';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const formats = {
      short: { dateStyle: 'short' },
      medium: { dateStyle: 'medium' },
      long: { dateStyle: 'long' },
      full: { dateStyle: 'full' },
      datetime: { dateStyle: 'medium', timeStyle: 'short' },
      time: { timeStyle: 'short' }
    };
    
    const options = formats[format] || formats.medium;
    return new Intl.DateTimeFormat('en-NG', options).format(dateObj);
  };
  
  /**
   * Format relative time (e.g., "2 days ago")
   * @param {string|Date} date - Date to format
   * @returns {string} - Relative time string
   */
  export const formatRelativeTime = (date) => {
    if (!date) return 'N/A';
    
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };
  
  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted file size
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Format phone number (Nigerian format)
   * @param {string} phone - Phone number to format
   * @returns {string} - Formatted phone number
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as Nigerian number
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.length === 13 && cleaned.startsWith('234')) {
      return `0${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    
    return phone;
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, length = 50) => {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  };
  
  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to capitalize
   * @returns {string} - Capitalized text
   */
  export const capitalizeWords = (text) => {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  /**
   * Format payment type for display
   * @param {string} type - Payment type
   * @returns {string} - Formatted payment type
   */
  export const formatPaymentType = (type) => {
    const types = {
      registration: 'Registration Fee',
      dues: 'Monthly Dues',
      fine: 'Fine',
      contribution: 'Contribution'
    };
    
    return types[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  /**
   * Format payment status with badge class
   * @param {string} status - Payment status
   * @returns {Object} - Status text and badge class
   */
  export const formatPaymentStatus = (status) => {
    const statuses = {
      paid: { text: 'Paid', class: 'bg-green-100 text-green-800' },
      unpaid: { text: 'Unpaid', class: 'bg-red-100 text-red-800' },
      pending: { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' }
    };
    
    return statuses[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
  };
  
  /**
   * Format user role for display
   * @param {string} role - User role
   * @returns {Object} - Role text and badge class
   */
  export const formatUserRole = (role) => {
    const roles = {
      admin: { text: 'Administrator', class: 'bg-purple-100 text-purple-800' },
      member: { text: 'Member', class: 'bg-blue-100 text-blue-800' }
    };
    
    return roles[role] || { text: role, class: 'bg-gray-100 text-gray-800' };
  };
  
  /**
   * Format transaction type for display
   * @param {string} type - Transaction type
   * @returns {Object} - Type text and icon color
   */
  export const formatTransactionType = (type) => {
    const types = {
      income: { text: 'Income', color: 'text-green-600', icon: 'trending-up' },
      expenditure: { text: 'Expenditure', color: 'text-red-600', icon: 'trending-down' },
      payment: { text: 'Payment', color: 'text-blue-600', icon: 'credit-card' }
    };
    
    return types[type] || { text: type, color: 'text-gray-600', icon: 'circle' };
  };
  
  /**
   * Generate initials from name
   * @param {string} name - Full name
   * @returns {string} - Initials (max 2 characters)
   */
  export const getInitials = (name) => {
    if (!name) return '';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  /**
   * Generate random color based on string
   * @param {string} str - Input string
   * @returns {string} - Hex color code
   */
  export const getColorFromString = (str) => {
    if (!str) return '#3B82F6';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  /**
   * Parse and format amount from string
   * @param {string|number} amount - Amount to parse
   * @returns {number} - Parsed amount
   */
  export const parseAmount = (amount) => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      const cleaned = amount.replace(/[₦$,]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  
  /**
   * Format chart tooltip label
   * @param {string} label - Tooltip label
   * @param {Object} payload - Chart payload
   * @returns {string} - Formatted label
   */
  export const formatChartTooltip = (label, payload) => {
    if (!payload || !payload.length) return label;
    
    const value = payload[0].value;
    return `${label}: ${formatCurrency(value)}`;
  };
  
  /**
   * Format month name
   * @param {number} month - Month number (1-12)
   * @param {string} format - Format type (short, long)
   * @returns {string} - Month name
   */
  export const formatMonth = (month, format = 'short') => {
    const date = new Date(2024, month - 1, 1);
    
    const formats = {
      short: { month: 'short' },
      long: { month: 'long' }
    };
    
    return new Intl.DateTimeFormat('en-NG', formats[format]).format(date);
  };
  
  /**
   * Format duration in human-readable format
   * @param {number} minutes - Duration in minutes
   * @returns {string} - Formatted duration
   */
  export const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  /**
   * Format account number with masking
   * @param {string} accountNumber - Account number
   * @param {boolean} showLastFour - Whether to show last 4 digits
   * @returns {string} - Formatted account number
   */
  export const formatAccountNumber = (accountNumber, showLastFour = false) => {
    if (!accountNumber) return '';
    
    const str = accountNumber.toString();
    if (showLastFour) {
      return `****${str.slice(-4)}`;
    }
    
    return str.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  
  /**
   * Validate and format email for display
   * @param {string} email - Email address
   * @returns {string} - Formatted email
   */
  export const formatEmail = (email) => {
    if (!email) return '';
    
    const [localPart, domain] = email.split('@');
    if (localPart.length > 15) {
      return `${localPart.slice(0, 10)}...@${domain}`;
    }
    
    return email;
  };
  
  export default {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatDate,
    formatRelativeTime,
    formatFileSize,
    formatPhoneNumber,
    truncateText,
    capitalizeWords,
    formatPaymentType,
    formatPaymentStatus,
    formatUserRole,
    formatTransactionType,
    getInitials,
    getColorFromString,
    parseAmount,
    formatChartTooltip,
    formatMonth,
    formatDuration,
    formatAccountNumber,
    formatEmail
  };