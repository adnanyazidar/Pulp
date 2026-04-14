import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const rawUri = process.env.DATABASE_URL;

/**
 * Configure Database Connection
 * Prioritizes direct URI usage for better TiDB Serverless compatibility.
 * Uses rejectUnauthorized: false for Vercel/TiDB SSL handshake.
 */
let poolInstance: mysql.Pool;

if (rawUri) {
  try {
    const url = new URL(rawUri);
    const isPlaceholder = url.password === '<PASSWORD>' || url.password === 'PASSWORD';
    
    if (isPlaceholder) {
      console.warn("⚠️ WARNING: DATABASE_URL seems to contain a password placeholder!");
    }

    console.log(`📡 DB Init: Attempting connection to ${url.hostname}`);
    
    // Using the URI directly is often more robust for TiDB Cloud
    poolInstance = mysql.createPool({ 
      uri: rawUri,
      ssl: { 
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false, 
      }, 
      waitForConnections: true, 
      connectionLimit: 3, 
      queueLimit: 0,
      connectTimeout: 20000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ DB Init Error (Parsing):", err.message);
    }
    poolInstance = mysql.createPool({
      uri: rawUri || "",
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
 */
export async function validateConnection(): Promise<{ ok: boolean; error?: string; code?: string; tables?: number; host?: string; passwordIsPlaceholder?: boolean }> {
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
    let host = 'unknown';
    let isPlaceholder = false;
    if (rawUri) {
       try { 
         const url = new URL(rawUri);
         host = url.hostname; 
         isPlaceholder = url.password === '<PASSWORD>' || url.password === 'PASSWORD';
       } catch {}
    }
    return { 
      ok: false, 
      error: err.message || 'Unknown connection error',
      code: err.code || err.errno?.toString() || 'UNKNOWN',
      host: host,
      passwordIsPlaceholder: isPlaceholder
    };
  }
}

export const poolConnection = poolInstance;
export const db = drizzle(poolConnection, { schema, mode: 'default' });
