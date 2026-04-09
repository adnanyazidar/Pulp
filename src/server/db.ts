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
    poolInstance = mysql.createPool({ 
      host: url.hostname, 
      port: parseInt(url.port) || 3306, 
      user: url.username, 
      password: decodeURIComponent(url.password), // Decodes special characters (@, #, etc.)
      database: url.pathname.replace("/", ""), // Extracts database name
      ssl: { 
        rejectUnauthorized: true, 
      }, 
      waitForConnections: true, 
      connectionLimit: 1, // Serverless-optimized
      queueLimit: 0,
    });
  } catch (err) {
    console.error("Failed to parse DATABASE_URL:", err);
    // Fallback to raw string if URL parsing fails for some reason
    poolInstance = mysql.createPool({
      uri: rawUri,
      ssl: { rejectUnauthorized: true },
      connectionLimit: 1
    });
  }
} else {
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
