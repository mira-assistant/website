import path from 'path';
import dotenv from 'dotenv';

// Must load before any module that reads process.env (e.g. shared/api/client).
dotenv.config({ path: path.join(__dirname, '../../.env') });
