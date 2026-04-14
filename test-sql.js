import mysql from "mysql2/promise";
import 'dotenv/config';

async function run() {
  const pool = mysql.createPool({ 
    uri: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false }  
  }); 
  try { 
    const conn = await pool.getConnection(); 
    const [rows] = await conn.query("SELECT DATE(created_at) as date, CAST(SUM(ROUND(duration / 60)) AS SIGNED) as minutes FROM sessions WHERE user_id = 1 AND created_at >= '2023-01-01' AND session_type = 'focus' GROUP BY DATE(created_at)"); 
    console.log(rows); 
    conn.release(); 
    process.exit(0); 
  } catch(err) { 
    console.error('Error:', err); 
    process.exit(1); 
  }
}
run();
