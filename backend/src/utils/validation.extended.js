/**
 * Extended Input Validation Utilities - Enterprise Grade
 * Comprehensive validation for all data types with edge case handling
 */

/**
 * Validate email format with edge cases
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return null;
  
  // Remove leading/trailing whitespace
  email = email.trim().toLowerCase();
  
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return null;
  
  // Check length limits (5 - 254 is RFC compliant)
  if (email.length < 5 || email.length > 254) return null;
  
  // Prevent homograph attacks (multiple dots, etc.)
  if (email.includes('..')) return null;
  
  return email;
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') return null;
  
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,128}$/;
  
  if (!passwordRegex.test(password)) {
    return null;
  }
  
  return password;
}

/**
 * Validate phone number
 */
function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return null;
  
  // Indian phone number: 10 digits, can have +91 prefix
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
  phone = phone.trim().replace(/[-\s]/g, '');
  
  if (!phoneRegex.test(phone)) return null;
  
  return phone;
}

/**
 * Validate date string with edge cases
 */
function validateDateString(dateStr) {
  if (!dateStr) return null;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return null;
  
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date.getTime())) return null;
  
  // Prevent dates in the far future (>100 years) or past (>1900)
  const now = new Date();
  const year = date.getFullYear();
  if (year < 1900 || year > now.getFullYear() + 100) return null;
  
  return dateStr;
}

/**
 * Validate date range (start <= end)
 */
function validateDateRange(startDate, endDate) {
  if (!validateDateString(startDate) || !validateDateString(endDate)) {
    return false;
  }
  
  return new Date(startDate) <= new Date(endDate);
}

/**
 * Validate month string with edge cases
 */
function validateMonthString(monthStr) {
  if (!monthStr) return null;
  
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(monthStr)) return null;
  
  const parts = monthStr.split('-');
  const month = parseInt(parts[1]);
  
  if (month < 1 || month > 12) return null;
  
  return monthStr;
}

/**
 * Validate positive integer with range
 */
function validatePositiveInteger(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = parseInt(value);
  
  if (isNaN(num) || num < min || num > max) {
    return defaultValue;
  }
  
  return num;
}

/**
 * Validate number range
 */
function validateNumberRange(value, min, max) {
  const num = parseFloat(value);
  
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  
  return num;
}

/**
 * Validate enum value
 */
function validateEnum(value, allowedValues, defaultValue = null) {
  if (!Array.isArray(allowedValues) || !value) {
    return defaultValue;
  }
  
  if (allowedValues.includes(String(value).toLowerCase())) {
    return String(value).toLowerCase();
  }
  
  return defaultValue;
}

/**
 * Validate string length
 */
function validateStringLength(value, minLength = 1, maxLength = 500) {
  if (typeof value !== 'string') return null;
  
  value = value.trim();
  
  if (value.length < minLength || value.length > maxLength) {
    return null;
  }
  
  return value;
}

/**
 * Validate sort order
 */
function validateSortOrder(order) {
  const validOrders = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];
  
  if (!validOrders.includes(String(order).toLowerCase())) {
    return '1';
  }
  
  return order;
}

/**
 * Validate category
 */
function validateCategory(category) {
  if (!category) return null;
  
  const allowedCategories = ['food', 'utilities', 'maintenance', 'miscellaneous', 'other'];
  
  return allowedCategories.includes(category.toLowerCase()) ? category.toLowerCase() : null;
}

/**
 * Validate meal type
 */
function validateMealType(mealType) {
  if (!mealType) return null;
  
  const allowedTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  
  return allowedTypes.includes(mealType.toLowerCase()) ? mealType.toLowerCase() : null;
}

/**
 * Validate meal rating (1-5)
 */
function validateRating(rating) {
  const num = parseInt(rating);
  
  if (isNaN(num) || num < 1 || num > 5) {
    return null;
  }
  
  return num;
}

/**
 * Validate user role
 */
function validateRole(role) {
  const allowedRoles = ['student', 'manager', 'treasurer', 'admin'];
  
  return allowedRoles.includes(String(role).toLowerCase()) ? String(role).toLowerCase() : null;
}

/**
 * Validate MongoDB ObjectId
 */
function validateObjectId(id) {
  if (!id || typeof id !== 'string') return null;
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  return objectIdRegex.test(id) ? id : null;
}

/**
 * Sanitize string input (prevent XSS)
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate and sanitize any input
 */
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  return input;
}

/**
 * Validate expense amount
 */
function validateExpenseAmount(amount) {
  const num = parseFloat(amount);
  
  // 0 to 100,000 INR (reasonable max for hostel meal)
  if (isNaN(num) || num < 0 || num > 100000) {
    return null;
  }
  
  // Two decimal places
  return Math.round(num * 100) / 100;
}

/**
 * Validate college ID format
 */
function validateCollegeId(collegeId) {
  if (!collegeId || typeof collegeId !== 'string') return null;
  
  collegeId = collegeId.toUpperCase().trim();
  
  // Allow alphanumeric with hyphens, 3-20 chars
  const collegeIdRegex = /^[A-Z0-9\-]{3,20}$/;
  
  if (!collegeIdRegex.test(collegeId)) return null;
  
  return collegeId;
}

/**
 * Validate room number
 */
function validateRoomNumber(roomNumber) {
  if (!roomNumber || typeof roomNumber !== 'string') return null;
  
  // Allow alphanumeric, 1-10 chars
  const roomRegex = /^[A-Z0-9\-]{1,10}$/i;
  
  if (!roomRegex.test(roomNumber)) return null;
  
  return roomNumber.toUpperCase().trim();
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateDateString,
  validateDateRange,
  validateMonthString,
  validatePositiveInteger,
  validateNumberRange,
  validateEnum,
  validateStringLength,
  validateSortOrder,
  validateCategory,
  validateMealType,
  validateRating,
  validateRole,
  validateObjectId,
  sanitizeString,
  sanitizeInput,
  validateExpenseAmount,
  validateCollegeId,
  validateRoomNumber,
};
