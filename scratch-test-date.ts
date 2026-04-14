import { db } from "./src/server/db";
import { sql } from 'drizzle-orm';
import 'dotenv/config';

async function testRawSqlFormat() {
  const dateStr = "2026-01-01";
  const rawSql = `
    SELECT 
      DATE(created_at) as date, 
      CAST(SUM(ROUND(duration / 60)) AS SIGNED) as minutes 
    FROM sessions 
    WHERE user_id = 1 
      AND created_at >= ? 
      AND session_type = 'focus'
    GROUP BY DATE(created_at)
  `;
  const [rows] = await db.execute(
    sql.raw(rawSql.replace('?', '1').replace('?', "'" + dateStr + "'"))
  );
  console.log('Returned rows:', rows);
  console.log('Type of date:', typeof (rows as any)[0]?.date);
  if ((rows as any)[0]?.date instanceof Date) {
    console.log('Date is a Date object!');
  }
}

testRawSqlFormat().then(() => process.exit(0)).catch(e => console.error(e));
