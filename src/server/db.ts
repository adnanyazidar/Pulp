import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const rawUri = process.env.DATABASE_URL;

/**
 * Configure Database Connection
 * Use the full DATABASE_URL if provided, allowing mysql2 to parse SSL parameters from the URI.
 * For TiDB Cloud, ensure DATABASE_URL includes: ?ssl={"rejectUnauthorized":true}
 */
export const poolConnection = rawUri 
  ? mysql.createPool(rawUri) // Let mysql2 handle the full URI including query parameters
  : mysql.createPool({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: process.env.DB_NAME || "pulp_ultra",
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
    });

export const db = drizzle(poolConnection, { schema, mode: 'default' });
