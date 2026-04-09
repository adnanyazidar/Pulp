import { app } from '@/server/app';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Explicitly use Node.js runtime for mysql2 and bcryptjs compatibility
export const maxDuration = 60; // Increase timeout to 60s for cold starts and heavy DB operations

export const GET = app.handle;
export const POST = app.handle;
export const PATCH = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
