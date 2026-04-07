# PomoPulse (Pulp)

*Master your rhythm. Stay in flow.*

A high-performance, aesthetically pleasing Pomodoro application built with Next.js and Elysia.js. Featuring real-time "Bulletproof Sync" between Timer and Analytics modules, integrated task management, and deep gamification.

## ✨ Features

- **Bulletproof Sync**: Atomic backend transactions ensure that focus sessions, task progress, and user stats (XP, level, streaks) are always consistent.
- **Customizable Timer**: Focus (25m), Short Break (5m), and Long Break (15m) modes with dynamic theme transitions.
- **Task Management**: Integrated To-Do list with project grouping (Work, Study, Personal) and Pomodoro estimation.
- **Analytics Dashboard**: 90-day daily activity heatmap, weekly progress charts, and real-time focus velocity metrics.
- **Hybrid Auth**: Secure JWT-based cloud synchronization for persistent settings and focus history.
- **Rich Aesthetics**: Vibrant dark mode with glassmorphism and smooth micro-animations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16.2.2](https://nextjs.org/) (App Router, Turbopack)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) with Persistence
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: Vanilla CSS & Tailwind CSS

### Backend
- **Framework**: [ElysiaJS](https://elysiajs.com/) (Bun Runtime)
- **Database**: [MySQL](https://www.mysql.com/) via [Drizzle ORM](https://orm.drizzle.team/)
- **API Client**: [Eden Treaty](https://elysiajs.com/eden/treaty) (End-to-end Type Safety)

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/)
- [MySQL](https://www.mysql.com/)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   bun install
   cd backend && bun install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/pulp_ultra
   JWT_SECRET=your-secret-key
   ```

3. Initialize the database:
   ```bash
   cd backend
   npx drizzle-kit push
   ```

4. Start the development server:
   ```bash
   bun run dev
   ```

## 🏗️ Technical Architecture

### Atomic Record Update (Bulletproof Sync)
The core synchronization logic uses a database transaction to ensure data integrity:
1. `sessions`: Logs the focus interval.
2. `tasks`: Increments `act_pomos` for the linked task.
3. `user_stats`: Updates `xp`, `level`, `totalFocusMinutes`, and `currentStreak`.

### Frontend Revalidation
The `stats-store` subscribes to the `timer-store` via a "Pulse" signal. When a session finishes, the dashboard immediately re-validates the analytics summary from the source of truth, eliminating desynchronization bugs across multiple tabs.

---

*Transition to a Real Database (MySQL), Hybrid Auth Implementation, and Comprehensive Code Cleanup.*
