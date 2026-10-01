/**
 * Formats a date consistently across the application
 * Uses the same format as All Statements page (DD/MM/YYYY)
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string in DD/MM/YYYY format or empty string if invalid
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date with time consistently across the application
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date and time string or empty string if invalid
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return '';
  }
};
