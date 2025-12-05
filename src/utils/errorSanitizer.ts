/**
 * Sanitizes error messages to avoid exposing internal details to users.
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose API errors or internal details
    if (error.message.includes('OpenAI') || error.message.includes('API')) {
      return 'An error occurred while processing your request. Please try again.';
    }
    // Allow known safe error messages
    if (error.message.includes('Rate limit') || error.message.includes('logged in')) {
      return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again later.';
}
