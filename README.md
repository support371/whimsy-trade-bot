# Whimsy Trade Bot

AI-powered paper trading simulator with risk management, market analysis, and portfolio tracking.

## Features

- Paper trading simulation (no real money at risk)
- Real-time crypto price tracking
- AI-powered market insights
- Risk management with kill switch
- Portfolio tracking and P&L charts
- Trade execution logging and audit trail

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** shadcn/ui, Tailwind CSS
- **State:** TanStack Query, React Context
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **Charts:** Recharts

## Prerequisites

- Node.js 18+ 
- npm or bun
- Supabase account (for backend)

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd whimsy-trade-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy the example env file and update with your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:8080`

## Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## Deployment to Vercel

### Option 1: Vercel Dashboard

1. Import your repository in the Vercel dashboard
2. Configure the following settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

4. Deploy

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Vercel Configuration

The `vercel.json` file is pre-configured for SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures all routes (like `/dashboard`) work correctly on direct access.

## Environment Variables

### Frontend (Public - Safe for Browser)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

### Backend (Server-Only - Set in Vercel/Supabase)

These are configured in Supabase Edge Functions secrets, NOT in `.env`:

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `LOVABLE_API_KEY` | AI insights API key |

## Project Structure

```
src/
  components/     # UI components
    dashboard/    # Dashboard-specific components
    trading/      # Trading-related components
    charts/       # Chart components
    ui/           # shadcn/ui primitives
  contexts/       # React contexts (Auth, etc.)
  hooks/          # Custom React hooks
  integrations/   # Third-party integrations
  lib/            # Utility functions
  pages/          # Page components
  types/          # TypeScript types
supabase/
  functions/      # Edge functions
  migrations/     # Database migrations
```

## Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Main trading interface | Yes |
| `/auth` | Login/signup | No |
| `/dashboard` | Trading dashboard | Yes |
| `/trade` | Execute trades | Yes |
| `/portfolio` | Portfolio view | Yes |
| `/alerts` | Price alerts | Yes |
| `/config` | Trading configuration | Yes |
| `/status` | System status & audit | Yes |

## Security

- All protected routes require authentication
- API keys and secrets are never exposed to the frontend
- Supabase Row Level Security (RLS) enforces data access
- Kill switch provides emergency trade halt
- Paper trading mode is default (no real funds at risk)

## Risk Controls

- **Emergency Stop (Kill Switch):** Immediately halts all trading
- **Max Daily Loss:** Automatic stop when daily loss limit reached
- **Max Risk Per Trade:** Limits position sizing
- **Max Leverage:** Caps leverage multiplier
- **Volatility Limit:** Blocks trades during high volatility

## Manual Test Checklist

Before deploying to production, verify:

- [ ] `/` loads and shows the main trading interface
- [ ] `/dashboard` loads directly (not just via navigation)
- [ ] `/auth` allows login and signup
- [ ] Unauthenticated users are redirected to `/auth`
- [ ] Emergency stop banner appears when kill switch is active
- [ ] Paper/Live mode badge is visible
- [ ] Risk limits are displayed on dashboard
- [ ] Mobile layout is usable
- [ ] No console errors in browser dev tools
- [ ] Network tab shows no exposed secrets

## Limitations

- Paper trading only (live trading requires additional setup)
- AI insights require LOVABLE_API_KEY configuration
- Real-time prices depend on external API availability

## License

Private - All rights reserved
