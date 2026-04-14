import { db } from "./src/server/db";
import { sessions } from "./src/server/schema";
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function checkSessions() {
  const allSessions = await db.select().from(sessions).where(eq(sessions.userId, 1));
  console.log(`Total sessions: ${allSessions.length}`);
  if (allSessions.length > 0) {
    const totalDurationSeconds = allSessions.reduce((acc, curr) => acc + curr.duration, 0);
    console.log(`Total duration in seconds: ${totalDurationSeconds}`);
    console.log(`Total duration in minutes: ${totalDurationSeconds / 60}`);
    console.log(`Total duration in hours: ${totalDurationSeconds / 3600}`);
    console.log(`First 5 sessions:`, allSessions.slice(0, 5).map(s => ({ id: s.id, dur: s.duration, type: s.sessionType })));
  }
}

checkSessions().then(() => process.exit());
