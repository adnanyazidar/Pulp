import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const rawUri = process.env.DATABASE_URL;

/**
 * Configure Database Connection
 * Manual parsing to avoid driver URI parsing bugs and handle special characters.
 * Uses rejectUnauthorized: false for TiDB Cloud compatibility on Vercel serverless.
 */
let poolInstance: mysql.Pool;

if (rawUri) {
  try {
    const url = new URL(rawUri);
    const dbName = url.pathname.replace("/", "") || "pulp_ultra";
    
    console.log(`📡 DB Init: Connecting to ${url.hostname} as ${url.username} (DB: ${dbName})`);
    
    poolInstance = mysql.createPool({ 
      host: url.hostname, 
      port: parseInt(url.port) || 4000, 
      user: url.username, 
      password: decodeURIComponent(url.password),
      database: dbName,
      ssl: { 
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false, 
      }, 
      waitForConnections: true, 
      connectionLimit: 3, 
      queueLimit: 0,
      connectTimeout: 20000, // 20s timeout for cold starts
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ DB Init Error (Parsing):", err.message);
    }
    poolInstance = mysql.createPool({
      uri: rawUri,
      ssl: { 
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false 
      },
      connectionLimit: 3,
      connectTimeout: 20000,
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

/**
 * Validate the database connection by executing a simple query.
 * Returns the raw error for proper surfacing in health checks.
 */
export async function validateConnection(): Promise<{ ok: boolean; error?: string; code?: string; tables?: number }> {
  try {
    const conn = await poolInstance.getConnection();
    try {
      const [rows] = await conn.query('SHOW TABLES');
      const tables = rows as unknown as any[];
      return { ok: true, tables: tables.length };
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return { 
      ok: false, 
      error: err.message || 'Unknown connection error',
      code: err.code || err.errno?.toString() || 'UNKNOWN',
    };
  }
}

export const poolConnection = poolInstance;
export const db = drizzle(poolConnection, { schema, mode: 'default' });
