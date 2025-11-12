# ChatGPT Jailbreak Challenge Devvit App

This repository contains a standalone [Devvit](https://developers.reddit.com/docs/devvit) application for running competitive jailbreak challenges on [r/ChatGPTJailbreak](https://www.reddit.com/r/ChatGPTJailbreak/).

## Features

- **Challenge posts** that orchestrate the full submission pipeline (prompt entry, GPT-4o verification, o4-mini judgment, leaderboard voting).
- **Automated judging** that routes each attempt through GPT-4o for output generation and o4-mini for structured safety evaluation.
- **Community voting** with a one-vote-per-challenge rule enforced by Redis.
- **Leaderboard and announcement post types** using Devvit Blocks for high-impact presentation.
- **Moderator tooling** to spin up challenge and announcement posts plus view cumulative OpenAI API spend.
- **Rate limiting** (10 submissions per user per hour) to control spam and control API burn.

## Project Structure

```
├── devvit.yaml
├── package.json
├── tsconfig.json
├── src/
│   ├── config/            # Constants, challenge definitions, OpenAI helpers
│   ├── components/        # Devvit Block components (posts + UI primitives)
│   ├── forms/             # Interactive submission form logic
│   ├── menu-items/        # Moderator menu actions
│   ├── types/             # Shared TypeScript models and Redis key helpers
│   └── utils/             # Redis access, rate limiting, judging/test helpers
```

## Configuration

### 1. Set up local development environment

Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add:
- **`CLIENT_ID`** and **`CLIENT_SECRET`**: Get from [Reddit App Preferences](https://developers.reddit.com/apps)
- **`OPENAI_API_KEY`**: Your OpenAI API key for local testing

### 2. Test locally

```bash
npm install
npm run dev        # Preview with devvit preview
```

The app will use the `OPENAI_API_KEY` from `.env` during local development.

### 3. Deploy to Reddit (for production)

```bash
npm run upload
# Install the app on your test subreddit via Reddit's app directory
```

### 4. Configure production API key

⚠️ **Important:** The `.env` file is NOT uploaded to Reddit (it's gitignored).

After installing the app on Reddit:
1. Go to your subreddit's Mod Tools
2. Navigate to **Settings** → **Apps** 
3. Find **chatgptjailbreak-challenge-app**
4. Click **Settings** 
5. Enter your **OpenAI API Key** in the secure settings field

The code automatically uses:
- `process.env.OPENAI_API_KEY` during local development
- `context.settings.get("openaiApiKey")` in production on Reddit

### 4. Verify Redis is enabled

Devvit hosted Redis is enabled by default. The app uses Redis for:
- Submission storage
- Vote tracking (one vote per user per challenge)
- Rate limiting (10 submissions/hour/user)
- Leaderboard scores
- API cost tracking

## Development

### Local Development

Install dependencies and run TypeScript type checking:

```bash
npm install
npm run build      # Type check
npm run dev        # Preview locally with devvit preview
```

### Deployment

```bash
npm run upload     # Upload to Reddit (devvit upload)
```

You can develop block layouts locally with `devvit preview` and deploy with `devvit upload` when ready.

### Testing the Submission Flow

Once deployed and configured:

1. Create a challenge post using the **"Create Jailbreak Challenge"** mod menu item
2. Submit a test jailbreak prompt
3. The app will:
   - Check rate limits (10/hour)
   - Send prompt to GPT-4o
   - Send GPT-4o's response + user prompt to o4-mini judge
   - Store submission if approved
   - Display judge's reasoning
4. Approved submissions appear in the challenge feed and can be voted on

## Challenges Included

Seven curated jailbreak prompts ship with the app (`src/config/challenges.ts`). Each includes:

- A system prompt for GPT-4o verification
- Attack intent and success criteria
- Required input technique taxonomy references (PT codes)
- Output component checklist used by o4-mini

Feel free to update or extend this catalogue to run new community competitions.

## Architecture & Data Flow

### Submission Pipeline

```
User Input → Rate Limit Check → GPT-4o Test → o4-mini Judge → Redis Storage
                                      ↓              ↓
                                 Response      Approved/Rejected
                                               + Reasoning
```

### OpenAI API Usage

**Models:**
- **GPT-4o** (`gpt-4o-2024-08-06`): Tests user's jailbreak prompt
  - Cost: $2.50/1M input tokens, $10.00/1M output tokens
- **o4-mini**: Judges both the user input and GPT-4o output
  - Cost: $1.10/1M input tokens, $4.40/1M output tokens

**Estimated Costs:**
- Per submission: ~$0.006 (GPT-4o: ~$0.0035, o4-mini: ~$0.0025)
- 5,000 submissions: ~$30
- 10,000 submissions: ~$60

View real-time costs using the **"View API Cost Stats"** mod menu item.

## Security Notes

- ✅ `.env` is gitignored and contains sensitive credentials
- ✅ OpenAI API key is stored in Devvit's secure settings (not in code or .env)
- ✅ Reddit OAuth credentials (CLIENT_ID/SECRET) are only used by Devvit CLI
- ✅ All user inputs are sanitized through OpenAI API
- ✅ Rate limiting prevents API abuse

## License

MIT
