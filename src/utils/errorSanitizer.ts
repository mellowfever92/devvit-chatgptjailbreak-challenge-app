/**
 * Sanitizes error messages to avoid exposing internal details to users.
 * Uses an allowlist approach for known safe messages.
 */

// Allowlisted safe error message patterns
const SAFE_ERROR_PATTERNS = [
  /^Rate limit exceeded/i,
  /^You must be logged in/i,
  /^Prompt exceeds maximum length/i,
  /^Prompt must be at least/i,
  /^Global rate limit exceeded/i,
  /^API request timed out/i,
];

export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check if the message matches any safe pattern
    for (const pattern of SAFE_ERROR_PATTERNS) {
      if (pattern.test(error.message)) {
        return error.message;
      }
    }
  }
  // For all other errors, return a generic message
  return 'An unexpected error occurred. Please try again later.';
}
