import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Get the project root directory
const projectRoot = process.cwd();

// Determine which environment file to load
let envFile;
if (process.env.DOTENV_PATH) {
    envFile = process.env.DOTENV_PATH;
} else if (process.env.NODE_ENV === 'test') {
    envFile = '.env.test';
} else {
    envFile = '.env';
}

const envPath = path.resolve(projectRoot, envFile);

// Verify the environment file exists
if (!fs.existsSync(envPath)) {
    throw new Error(`Environment file not found: ${envPath}`);
}

console.log('Loading environment from:', envPath);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DOTENV_PATH:', process.env.DOTENV_PATH);

// Load environment variables
const result = dotenv.config({ path: envPath });
if (result.error) {
    throw new Error(`Error loading environment file: ${result.error.message}`);
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export default pool;