# PomoPulp (Pulp)

*Master your rhythm. Stay in flow.*

A high-performance, aesthetically pleasing Pomodoro application built with an advanced **Mono-Architecture** combining Next.js and ElysiaJS. Featuring real-time "Bulletproof Sync," integrated task management, Focus Media Hub, and deep gamification.

## ✨ Key Features

- **Bulletproof Sync**: Atomic backend transactions ensure that focus sessions, task progress, and user stats are always flawlessly synchronized.
- **Hybrid Auth & Smart Merge Migration**: Secure JWT-based cloud synchronizations with frictionless merging of local and cloud states.
- **Focus Media Hub**: Integrated workspace for your favorite ambient sounds (Rain, Cafe) and YouTube/Spotify playlists.
- **Elite Gamification**: Level up, earn XP, maintain streaks, and unlock Elite Badges to turn discipline into a rewarding game.
- **Analytics Heatmap**: 90-day daily activity tracking, progress charts, and real-time focus velocity metrics.

## 🛠️ Refined Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) with Serverless API Routes
- **Backend API**: [ElysiaJS](https://elysiajs.com/) (Next.js Integrated Hybrid)
- **Database**: [TiDB Cloud Serverless (MySQL)](https://tidb.cloud/) via [Drizzle ORM](https://orm.drizzle.team/)
- **Type Safety**: [Eden Treaty](https://elysiajs.com/eden/treaty) for flawless end-to-end typing
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS with dynamic themes
- **Security**: Authentication powered by `bcryptjs` and `@elysiajs/jwt`

## 🚀 Environment Setup & Installation

The project uses a **Mono-Architecture** where the backend runs seamlessly inside Next.js API routes. (No separate `backend/` folder needed!)

### Prerequisites
- [Bun](https://bun.sh/)
- A MySQL Database (e.g., TiDB Serverless)

### Installation

1. Clone the repository and install dependencies at the root:
   ```bash
   bun install
   ```

2. Configure environment variables in `.env` (or `.env.local`):
   ```env
   DATABASE_URL=mysql://user:password@hostname:4000/database?ssl={"rejectUnauthorized":true}
   JWT_SECRET=your-super-secret-key-pulp
   ```

3. Push the database schema:
   ```bash
   bunx drizzle-kit push
   ```

4. Start the development server (Frontend and API run together):
   ```bash
   bun run dev
   ```

## 🌐 Deployment Strategy

PomoPulp is built for **zero-cost infrastructure** and ultimate developer experience.

- **Single-Click Deployment on Vercel**: Push to `main`, and Vercel will automatically compile the Next.js frontend and mount the ElysiaJS backend as blazing-fast Serverless Functions (`/api/*`), entirely escaping CORS issues and network latency.
