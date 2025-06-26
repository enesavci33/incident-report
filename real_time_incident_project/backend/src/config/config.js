// src/config/config.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ESM ortamında __dirname tanımlaması
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// .env dosyasının gerçek yolunu ver ve yükle
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  postgres: {
    host:     process.env.PG_HOST     || 'localhost',
    port:     Number(process.env.PG_PORT) || 5432,
    user:     process.env.PG_USER     || 'postgres',
    password: process.env.PG_PASS     || 'password',
    database: process.env.PG_DB       || 'dbRealTimeIncident',
  },
  jwtSecret: process.env.JWT_SECRET || 'secret',
};

export default config;
