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

1. Deploy the app with Devvit CLI and install it on your subreddit.
2. In the app settings UI, add the **OpenAI API key** (required for GPT-4o + o4-mini calls).
3. Ensure Redis is enabled for the installation (Devvit hosted Redis works out of the box).

## Development

Install dependencies and run the TypeScript compiler for static checks:

```bash
npm install
npm run build
```

You can develop block layouts locally with `devvit preview` and deploy with `devvit deploy` once you are ready.

## Challenges Included

Seven curated jailbreak prompts ship with the app (`src/config/challenges.ts`). Each includes:

- A system prompt for GPT-4o verification
- Attack intent and success criteria
- Required input technique taxonomy references (PT codes)
- Output component checklist used by o4-mini

Feel free to update or extend this catalogue to run new community competitions.
