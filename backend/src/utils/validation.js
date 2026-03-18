/**
 * Input validation utilities to prevent NoSQL injection and other attacks
 */

/**
 * Validate and sanitize date string (YYYY-MM-DD format)
 * @param {string} dateStr - Date string to validate
 * @param {string} defaultValue - Default value if invalid (defaults to today)
 * @returns {string} - Valid date string or default
 */
function validateDateString(dateStr, defaultValue = null) {
  if (!dateStr) {
    return defaultValue || new Date().toISOString().split('T')[0];
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return defaultValue || new Date().toISOString().split('T')[0];
  }

  // Verify it's a valid date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return defaultValue || new Date().toISOString().split('T')[0];
  }

  return dateStr;
}

/**
 * Validate and sanitize month string (YYYY-MM format)
 * @param {string} monthStr - Month string to validate
 * @param {string} defaultValue - Default value if invalid (defaults to current month)
 * @returns {string} - Valid month string or default
 */
function validateMonthString(monthStr, defaultValue = null) {
  if (!monthStr) {
    return defaultValue || new Date().toISOString().slice(0, 7);
  }
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(monthStr)) {
    return defaultValue || new Date().toISOString().slice(0, 7);
  }

  // Verify it's a valid month
  const parts = monthStr.split('-');
  const month = parseInt(parts[1]);
  if (month < 1 || month > 12) {
    return defaultValue || new Date().toISOString().slice(0, 7);
  }

  return monthStr;
}

/**
 * Validate and sanitize positive integer
 * @param {any} value - Value to validate
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} - Valid positive integer or default
 */
function validatePositiveInteger(value, defaultValue = 0) {
  const num = parseInt(value);
  if (isNaN(num) || num <= 0) {
    return defaultValue;
  }
  return num;
}

/**
 * Validate enum value
 * @param {string} value - Value to validate
 * @param {array} allowedValues - Array of allowed values
 * @param {string} defaultValue - Default value if invalid
 * @returns {string} - Valid enum value or default
 */
function validateEnum(value, allowedValues, defaultValue = null) {
  if (allowedValues.includes(value)) {
    return value;
  }
  return defaultValue;
}

/**
 * Validate sort order
 * @param {string} order - Sort order (asc/desc)
 * @returns {string} - Valid sort order ('asc' or 'desc')
 */
function validateSortOrder(order) {
  const validOrders = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];
  if (!validOrders.includes(String(order).toLowerCase())) {
    return 'asc';
  }
  if (order === '-1' || order === 'descending') {
    return 'desc';
  }
  if (order === '1' || order === 'ascending') {
    return 'asc';
  }
  return order;
}

/**
 * Validate category from allowed list
 * @param {string} category - Category to validate
 * @param {string} defaultValue - Default value if invalid (defaults to 'miscellaneous')
 * @returns {string} - Valid category or default
 */
function validateCategory(category, defaultValue = 'miscellaneous') {
  if (!category) {
    return defaultValue;
  }
  const allowedCategories = ['food', 'utilities', 'maintenance', 'miscellaneous', 'groceries', 'other'];
  return allowedCategories.includes(category.toLowerCase()) ? category : defaultValue;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  // Accept 10+ digits, allowing common formats: +1-234-567-8900, (234) 567-8900, 2345678900
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

module.exports = {
  validateDateString,
  validateMonthString,
  validatePositiveInteger,
  validateEnum,
  validateSortOrder,
  validateCategory,
  validateEmail,
  validatePhone,
};
