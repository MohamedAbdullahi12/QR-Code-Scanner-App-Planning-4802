/**
 * Security utilities for QuickQR application
 * Provides sanitization and other security functions
 */
import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} content - The content to sanitize
 * @returns {string} - Sanitized content
 */
export const sanitizeContent = (content) => {
  if (typeof content !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No HTML attributes allowed
  });
};

/**
 * Safely stores data in localStorage with size limits
 * @param {string} key - The localStorage key
 * @param {any} data - The data to store
 * @param {number} maxSize - Maximum size in bytes (default: 100KB)
 * @returns {boolean} - Success status
 */
export const safeStoreData = (key, data, maxSize = 102400) => {
  try {
    const jsonData = JSON.stringify(data);
    
    // Check size limit
    if (jsonData.length > maxSize) {
      console.warn(`Data for ${key} exceeds size limit of ${maxSize} bytes`);
      return false;
    }
    
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

/**
 * Safely retrieves data from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Retrieved data or default value
 */
export const safeGetData = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Retrieval error:', error);
    return defaultValue;
  }
};

/**
 * Validates URLs to prevent malicious links
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid and safe
 */
export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
};

/**
 * Validates email addresses
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email format is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone numbers (basic check)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone format is valid
 */
export const isValidPhone = (phone) => {
  // Basic validation - at least 7 digits, allows +, spaces, dashes, parentheses
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/;
  return phoneRegex.test(phone);
};