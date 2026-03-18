const {
  validateDateString,
  validateMonthString,
  validatePositiveInteger,
  validateEnum,
  validateSortOrder,
  validateCategory,
} = require('../utils/validation');

describe('Validation Utilities', () => {
  describe('validateDateString', () => {
    it('should accept valid date string in YYYY-MM-DD format', () => {
      const result = validateDateString('2024-03-18');
      expect(result).toBe('2024-03-18');
    });

    it('should return default value for invalid date', () => {
      const result = validateDateString('invalid', '2024-01-01');
      expect(result).toBe('2024-01-01');
    });

    it('should accept today if no string provided', () => {
      const result = validateDateString(null);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('validateMonthString', () => {
    it('should accept valid month string in YYYY-MM format', () => {
      const result = validateMonthString('2024-03');
      expect(result).toBe('2024-03');
    });

    it('should return default value for invalid month', () => {
      const result = validateMonthString('invalid', '2024-01');
      expect(result).toBe('2024-01');
    });

    it('should return current month if no string provided', () => {
      const result = validateMonthString(null);
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('validatePositiveInteger', () => {
    it('should accept valid positive integers', () => {
      expect(validatePositiveInteger('5')).toBe(5);
      expect(validatePositiveInteger('100')).toBe(100);
    });

    it('should reject zero and negative numbers', () => {
      expect(validatePositiveInteger('0', 10)).toBe(10);
      expect(validatePositiveInteger('-5', 10)).toBe(10);
    });

    it('should return default for non-numeric input', () => {
      expect(validatePositiveInteger('abc', 5)).toBe(5);
    });
  });

  describe('validateEnum', () => {
    const allowedValues = ['approved', 'pending', 'rejected'];

    it('should accept values in the enum', () => {
      expect(validateEnum('approved', allowedValues, 'pending')).toBe('approved');
    });

    it('should return default for values not in enum', () => {
      expect(validateEnum('invalid', allowedValues, 'pending')).toBe('pending');
    });

    it('should handle case sensitivity', () => {
      expect(validateEnum('APPROVED', allowedValues, 'pending')).toBe('pending');
    });
  });

  describe('validateSortOrder', () => {
    it('should accept ascending and descending', () => {
      expect(validateSortOrder('asc')).toBe('asc');
      expect(validateSortOrder('desc')).toBe('desc');
    });

    it('should default to asc for invalid input', () => {
      expect(validateSortOrder('invalid')).toBe('asc');
    });
  });

  describe('validateCategory', () => {
    it('should accept valid expense categories', () => {
      expect(validateCategory('groceries')).toBe('groceries');
      expect(validateCategory('utilities')).toBe('utilities');
    });

    it('should return miscellaneous for invalid category', () => {
      expect(validateCategory('invalid')).toBe('miscellaneous');
    });
  });
});
