import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const rawUri = process.env.DATABASE_URL;

/**
 * Configure Database Connection
 * "Bulletproof" manual parsing to avoid driver URI parsing bugs and handle special characters.
 */
let poolInstance;

if (rawUri) {
  try {
    const url = new URL(rawUri);
    const dbName = url.pathname.replace("/", "") || "pulp_ultra";
    
    console.log(`📡 DB Init: Connecting to ${url.hostname} as ${url.username} (DB: ${dbName})`);
    
    poolInstance = mysql.createPool({ 
      host: url.hostname, 
      port: parseInt(url.port) || 3306, 
      user: url.username, 
      password: decodeURIComponent(url.password),
      database: dbName,
      ssl: { 
        rejectUnauthorized: true, 
      }, 
      waitForConnections: true, 
      connectionLimit: 1, 
      queueLimit: 0,
      connectTimeout: 10000, // 10s timeout
    });
  } catch (err: any) {
    console.error("❌ DB Init Error (Parsing):", err.message);
    poolInstance = mysql.createPool({
      uri: rawUri,
      ssl: { rejectUnauthorized: true },
      connectionLimit: 1
    });
  }
} else {
  console.log("📂 DB Init: Falling back to Localhost");
  poolInstance = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: process.env.DB_NAME || "pulp_ultra",
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    connectionLimit: 10
  });
}

export const poolConnection = poolInstance;
export const db = drizzle(poolConnection, { schema, mode: 'default' });
