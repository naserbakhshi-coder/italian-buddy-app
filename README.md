# My Italian Buddy - AI Language Learning App

A text-based Italian language learning mobile app powered by Claude AI, featuring conversation practice, vocabulary flashcards, scenario-based role-play, and daily writing prompts.

## Tech Stack

- **Mobile**: React Native + Expo (iOS-first)
- **Backend**: Node.js + Express
- **AI**: Anthropic Claude Sonnet 4.5
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
.
├── workflows/          # AI agent instructions (markdown SOPs)
├── backend/           # Node.js API server
│   ├── routes/       # API endpoints
│   ├── db/           # Database client
│   ├── data/         # Seed data
│   ├── agent.js      # Claude AI agent
│   └── server.js     # Express server
└── mobile/           # React Native app
    └── src/
        ├── screens/  # App screens
        ├── components/ # Reusable components
        └── services/ # API client
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm installed
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Supabase account ([sign up here](https://supabase.com/))

### 1. Configure Environment Variables

Edit the `.env` file and add your API keys:

```bash
ANTHROPIC_API_KEY=your_actual_anthropic_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. In the SQL Editor, run the following schema:

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  mode TEXT, -- 'chat'|'scenario'|'daily_prompt'
  user_message TEXT,
  ai_response TEXT,
  grammar_corrections JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  word TEXT,
  translation TEXT,
  example_italian TEXT,
  correct_count INT DEFAULT 0,
  last_reviewed TIMESTAMP,
  next_review TIMESTAMP,
  UNIQUE(user_id, word)
);
```

3. Copy your Supabase URL and anon key to the `.env` file
   - Find these in: Project Settings > API

### 3. Run the Backend

```bash
cd backend
node server.js
```

The server will start on http://localhost:3000

### 4. Run the Mobile App

```bash
cd mobile
npx expo start
```

This will open the Expo dev server. You can:
- Press `i` to open iOS simulator
- Scan the QR code with Expo Go app on your iPhone
- Press `w` to open in web browser

## Development

### Backend Structure
- `backend/agent.js` - Claude AI integration, reads workflows from `workflows/` directory
- `backend/routes/` - API endpoints for each practice mode
- `backend/db/` - Supabase client and database helpers

### Mobile Structure
- `mobile/src/screens/` - Main app screens (Home, Chat, Vocabulary, Scenario, Daily Prompt)
- `mobile/src/components/` - Reusable UI components
- `mobile/src/services/api.js` - Backend API client

## Practice Modes

1. **Text Chat** - Conversational practice with grammar correction
2. **Vocabulary Flashcards** - Spaced repetition learning system
3. **Scenario Practice** - Role-play realistic situations (restaurant, travel, etc.)
4. **Daily Prompts** - Creative writing practice with AI feedback

## Cost Management

- Using Claude Sonnet 4.5 costs ~$0.003 per API call
- Set a monthly budget limit in your Anthropic dashboard
- Conversation history is limited to last 10 exchanges to reduce costs

## Deployment

### Backend (Railway)
```bash
# Connect your GitHub repo to Railway
# Add environment variables in Railway dashboard
# Auto-deploys on git push
```

### Mobile (TestFlight)
```bash
cd mobile
eas build --platform ios
eas submit --platform ios
```

## Next Steps

- [ ] Complete Phase 1: Text Chat Mode
- [ ] Complete Phase 2: Vocabulary Flashcards
- [ ] Complete Phase 3: Scenario Practice
- [ ] Complete Phase 4: Daily Prompts
- [ ] Deploy to production

## License

MIT
