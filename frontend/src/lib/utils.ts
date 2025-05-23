/**
 * Format a number as currency in MWK (Malawian Kwacha)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a phone number to a consistent format
 * @param phoneNumber - The phone number to format (e.g., "0881234567" or "+265881234567")
 * @returns Formatted phone number (e.g., "+265 88 123 4567")
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.length === 10) {
    // Format: 0881234567
    return `+265 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('265')) {
    // Format: 265881234567
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // Return original if format is not recognized
  return phoneNumber;
}

/**
 * Format a date to a localized string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-MW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to a specified length
 * @param text - The text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generate a random string of specified length
 * @param length - Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate an email address
 * @param email - The email to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a phone number
 * @param phoneNumber - The phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid Malawian number (10 digits starting with 0 or 12 digits starting with 265)
  return (
    (cleaned.length === 10 && cleaned.startsWith('0')) ||
    (cleaned.length === 12 && cleaned.startsWith('265'))
  );
} 