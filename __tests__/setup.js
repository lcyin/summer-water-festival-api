import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
const envPath = path.resolve(process.cwd(), '.env.test');
dotenv.config({ path: envPath });

// Log environment for debugging
console.log('Test Environment Setup:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME); 