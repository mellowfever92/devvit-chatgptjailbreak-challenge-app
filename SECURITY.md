# Security Policy

This document outlines the security posture of the ChatGPT Jailbreak Challenge Devvit application, including current security measures, identified gaps, and recommendations for improvement.

## Current Security Measures

### ✅ API Key Protection
- **Status**: Implemented correctly
- **Details**: The OpenAI API key is stored using Devvit's secret settings (`isSecret: true` in `devvit.yaml`)
- **Reference**: `devvit.yaml:20`

### ✅ Authorization Controls
- **Status**: Implemented correctly
- **Details**: Administrative menu actions (create challenge, create announcement, view stats) are restricted to moderators via `forUserType: 'moderator'`
- **Reference**: `src/menu-items/*.tsx`

### ✅ User Authentication
- **Status**: Implemented correctly
- **Details**: The submission form verifies user authentication before processing submissions
- **Reference**: `src/forms/SubmissionForm.tsx:33-36`

### ✅ Basic Rate Limiting
- **Status**: Implemented
- **Details**: Users are limited to 10 submissions per hour per challenge
- **Reference**: `src/utils/rateLimit.ts`, `src/config/constants.ts:2` (`RATE_LIMIT_SUBMISSIONS_PER_HOUR`)

## Identified Security Gaps & Recommendations

### 🔶 Input Validation (Medium Priority)

**Current State**: User prompts are accepted without validation or sanitization.

**Risk**: 
- Oversized prompts could increase API costs
- Malformed input could cause unexpected behavior

**Recommendation**:
Add input length validation in `SubmissionForm.tsx`:

```typescript
const MAX_PROMPT_LENGTH = 4000; // Reasonable limit for prompts

// In handleSubmit, before API calls:
if (prompt.length > MAX_PROMPT_LENGTH) {
  setState({ status: 'error', message: 'Prompt exceeds maximum length of 4000 characters.' });
  return;
}

if (prompt.trim().length < 10) {
  setState({ status: 'error', message: 'Prompt must be at least 10 characters.' });
  return;
}
```

### 🔶 API Request Timeouts (Medium Priority)

**Current State**: No timeout configured for OpenAI API requests.

**Risk**: Long-running or hanging requests could exhaust resources.

**Recommendation**:
Add AbortController with timeout in `src/config/openai.ts`:

```typescript
async chatCompletion(model: string, messages: OpenAiChatMessage[]): Promise<OpenAiChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
      signal: controller.signal,
    });
    // ... rest of implementation
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### 🔶 Error Message Sanitization (Low Priority)

**Current State**: Error messages are displayed directly to users.

**Risk**: Internal error details could leak sensitive information.

**Recommendation**:
Create a sanitized error handler:

```typescript
function sanitizeErrorMessage(error: unknown): string {
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
```

### 🟢 Rate Limiting Enhancement (Low Priority)

**Current State**: Rate limiting is per-challenge per-user.

**Potential Enhancement**: Consider adding a global rate limit across all challenges to prevent abuse.

```typescript
// Add to redis-keys.ts
export const globalRateLimitKey = (userId: string): string => `ratelimit:global:${userId}`;

// Add global check in rateLimit.ts
export async function checkGlobalRateLimit(userId: string): Promise<boolean> {
  const key = globalRateLimitKey(userId);
  const count = Number((await redisClient.get(key)) ?? 0);
  return count < GLOBAL_RATE_LIMIT_PER_HOUR; // e.g., 50 total submissions/hour
}
```

## Data Storage Security

### Redis Data
- **Submissions**: User prompts and AI responses are stored in Redis
- **Leaderboard**: Aggregated scores are stored without sensitive data
- **Votes**: Vote tracking includes user IDs for deduplication

**Note**: Devvit's Redis is isolated per-installation and managed by the platform.

## External Communications

### OpenAI API
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token using stored API key
- **Data Sent**: Challenge system prompts and user-submitted prompts
- **Data Received**: AI-generated responses

**Note**: User prompts are sent to OpenAI for processing. Users should be informed that their submissions are processed by external AI services.

## Dependency Security

Run `npm audit` regularly to check for known vulnerabilities in dependencies.

Current dependencies:
- `@devvit/public-api`: Devvit platform API
- `typescript`, `eslint`: Development tools only

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email the maintainers with details of the vulnerability
3. Allow reasonable time for a fix before public disclosure

## Security Checklist for Contributors

Before submitting code:

- [ ] User input is validated and sanitized
- [ ] Error messages don't expose internal details
- [ ] API keys and secrets are not hardcoded
- [ ] Rate limiting is in place for user actions
- [ ] Moderator-only actions check authorization
- [ ] External API calls have timeouts
- [ ] New dependencies are checked for vulnerabilities

---

*Last reviewed: December 2024*
