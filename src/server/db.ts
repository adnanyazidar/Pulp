import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const rawUri = process.env.DATABASE_URL;
let uri = rawUri;
let useSsl = false;

if (rawUri) {
  if (rawUri.includes('ssl=')) useSsl = true;
  uri = rawUri.split('?')[0]; // strip query string to avoid mysql2 ssl profile parsing errors
}

export const poolConnection = uri 
  ? mysql.createPool({ 
      uri, 
      ssl: useSsl ? { rejectUnauthorized: true } : undefined 
    })
  : mysql.createPool({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: process.env.DB_NAME || "pulp_ultra",
    });

export const db = drizzle(poolConnection, { schema, mode: 'default' });
