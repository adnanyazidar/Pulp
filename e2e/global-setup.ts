import mysql from 'mysql2/promise';
import { execSync } from 'child_process';
import path from 'path';

async function globalSetup() {
  console.log('--- Playwright Global Setup: Initializing Test Database ---');
  
  // Connect to MySQL server without specifying a database to create the testing database
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
  });

  try {
    console.log('Ensuring pulp_test database exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS pulp_test;');
    console.log('Database pulp_test created/verified.');
    
    // Completely clear existing tables to ensure a fresh environment
    console.log('Cleaning up existing tables for a fresh state...');
    
    // Read all tables from pulp_test
    const [tables] = await connection.query('SELECT table_name FROM information_schema.tables WHERE table_schema = "pulp_test"');
    
    if (Array.isArray(tables) && tables.length > 0) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
      for (const table of tables) {
        const tableName = (table as any).table_name || (table as any).TABLE_NAME;
        if (tableName) {
          await connection.query(`DROP TABLE IF EXISTS \`pulp_test\`.\`${tableName}\`;`);
        }
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
  } catch (error) {
    console.error('Error in creating test database:', error);
    throw error;
  } finally {
    await connection.end();
  }

  // Run Drizzle migration internally to construct the fresh tables
  console.log('Running drizzle-kit push on backend/drizzle.config.ts...');
  try {
    execSync('bunx drizzle-kit push', { 
        cwd: path.resolve(__dirname, '../backend'),
        env: {
          ...process.env,
          DATABASE_URL: 'mysql://root:@127.0.0.1:3306/pulp_test'
        },
        stdio: 'inherit' 
    });
    console.log('Schema pushed to pulp_test successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}

export default globalSetup;
