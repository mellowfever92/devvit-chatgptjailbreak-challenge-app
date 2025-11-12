# Development Guide

This guide covers local development and testing before deploying to Reddit.

## Prerequisites

- Node.js 18+ installed
- [Devvit CLI](https://developers.reddit.com/docs/get-started) installed: `npm install -g devvit`
- OpenAI API account with credits
- Reddit developer account

## Local Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/mellowfever92/devvit-chatgptjailbreak-challenge-app.git
cd devvit-chatgptjailbreak-challenge-app
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Reddit OAuth (from https://developers.reddit.com/apps)
CLIENT_ID=your_reddit_client_id
CLIENT_SECRET=your_reddit_client_secret

# OpenAI API Key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your-key-here
```

### 3. Authenticate Devvit CLI

```bash
devvit login
```

### 4. Run locally

```bash
npm run dev
```

This starts Devvit's local preview server. You can test the app UI and functionality locally.

## How Environment Variables Work

The code automatically detects the environment:

**Local Development:**
- Reads `OPENAI_API_KEY` from `.env` file
- Uses `process.env.OPENAI_API_KEY`

**Production (on Reddit):**
- `.env` is NOT uploaded (it's gitignored)
- Reads from Devvit secure settings
- Uses `context.settings.get("openaiApiKey")`

See `src/config/openai.ts` for the implementation:

```typescript
// Try Devvit settings first (production)
let apiKey = await context.settings.get("openaiApiKey");

// Fall back to environment variable (development)
if (!apiKey) {
  apiKey = process.env.OPENAI_API_KEY;
}
```

## Testing the Submission Flow

1. Start the preview server: `npm run dev`
2. Create a challenge post (use mod menu)
3. Submit a test jailbreak prompt
4. Verify:
   - Rate limiting works (10/hour)
   - GPT-4o responds to the prompt
   - o4-mini judges the submission
   - Approved submissions appear in feed
   - Voting works

## Deployment Workflow

### Test Environment

1. Create a private test subreddit (e.g., r/yourname_test)
2. Upload the app: `npm run upload`
3. Install on test subreddit
4. Configure OpenAI key in app settings
5. Test all features with low traffic

### Production (r/ChatGPTJailbreak)

1. **Request moderator approval** (required for apps using external APIs)
2. Provide documentation:
   - How the OpenAI API is used
   - Expected costs and rate limiting
   - Security measures in place
3. Once approved:
   - Upload: `npm run upload`
   - Install on r/ChatGPTJailbreak
   - Configure OpenAI key in secure settings
   - Monitor costs via "View API Cost Stats" menu

## Cost Management

Monitor API usage during testing:

```bash
# View real-time costs in the app
# Mod Tools → Apps → View API Cost Stats
```

**Development estimates:**
- Per submission: ~$0.006
- 100 test submissions: ~$0.60
- 1,000 test submissions: ~$6.00

Set up OpenAI usage alerts at https://platform.openai.com/usage

## Security Best Practices

✅ **DO:**
- Keep `.env` file local (it's gitignored)
- Use environment variables for local dev
- Use Devvit settings for production
- Rotate API keys periodically
- Monitor OpenAI usage dashboard

❌ **DON'T:**
- Commit `.env` to git
- Share API keys in Discord/Slack
- Hard-code credentials in source
- Deploy without rate limiting

## Troubleshooting

### "OpenAI API key is not configured"

**Local dev:** Check that `OPENAI_API_KEY` is set in `.env`

**Production:** Configure the key in Reddit app settings

### Rate limit errors from OpenAI

Your OpenAI account may have hit its quota. Check https://platform.openai.com/usage

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
npm run build
```

Fix any type errors before uploading.

## Next Steps

Once local testing is complete:
1. Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) (if exists)
2. Get moderator approval for r/ChatGPTJailbreak
3. Deploy to production
4. Monitor costs and performance

## Support

- [Devvit Documentation](https://developers.reddit.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- Report issues: [GitHub Issues](https://github.com/mellowfever92/devvit-chatgptjailbreak-challenge-app/issues)
