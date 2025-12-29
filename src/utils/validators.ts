// src/utils/validators.ts

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate book upload data
 */
export function validateBookUpload(data: {
  title: string;
  author: string;
  category: string;
  fileUri: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.author || data.author.trim().length === 0) {
    errors.push('Author is required');
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!data.fileUri) {
    errors.push('File is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
