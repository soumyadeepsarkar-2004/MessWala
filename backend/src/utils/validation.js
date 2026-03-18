/**
 * Input validation utilities to prevent NoSQL injection and other attacks
 */

/**
 * Validate and sanitize date string (YYYY-MM-DD format)
 * @param {string} dateStr - Date string to validate
 * @returns {string|null} - Valid date string or null
 */
function validateDateString(dateStr) {
  if (!dateStr) {
    return null;
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return null;
  }

  // Verify it's a valid date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }

  return dateStr;
}

/**
 * Validate and sanitize month string (YYYY-MM format)
 * @param {string} monthStr - Month string to validate
 * @returns {string|null} - Valid month string or null
 */
function validateMonthString(monthStr) {
  if (!monthStr) {
    return null;
  }
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(monthStr)) {
    return null;
  }

  // Verify it's a valid month
  const parts = monthStr.split('-');
  const month = parseInt(parts[1]);
  if (month < 1 || month > 12) {
    return null;
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
  if (isNaN(num) || num < 0) {
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
 * @returns {string} - Valid sort order
 */
function validateSortOrder(order) {
  const validOrders = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];
  if (!validOrders.includes(String(order).toLowerCase())) {
    return '1';
  }
  return order;
}

/**
 * Validate category from allowed list
 * @param {string} category - Category to validate
 * @returns {string|null} - Valid category or null
 */
function validateCategory(category) {
  if (!category) {
    return null;
  }
  const allowedCategories = ['food', 'utilities', 'maintenance', 'miscellaneous', 'other'];
  return allowedCategories.includes(category.toLowerCase()) ? category : null;
}

module.exports = {
  validateDateString,
  validateMonthString,
  validatePositiveInteger,
  validateEnum,
  validateSortOrder,
  validateCategory,
};
