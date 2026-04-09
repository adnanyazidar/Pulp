import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const rawUri = process.env.DATABASE_URL;

/**
 * Configure Database Connection
 * Use the explicit options object for better SSL reliability in serverless environments.
 */
export const poolConnection = rawUri 
  ? mysql.createPool({
      uri: rawUri,
      ssl: { 
        rejectUnauthorized: true 
      },
      waitForConnections: true,
      connectionLimit: 1, // Optimized for Vercel/Serverless cold starts
      queueLimit: 0
    })
  : mysql.createPool({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: process.env.DB_NAME || "pulp_ultra",
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
      connectionLimit: 10
    });

export const db = drizzle(poolConnection, { schema, mode: 'default' });
