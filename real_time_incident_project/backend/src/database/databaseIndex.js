import db from './db.js';
import { initTables } from './databaseModel.js';

export async function connectDatabase() {
    try {
        // 1) İlk bağlantıyı test et
        const client = await db.connect();
        console.log('Connected to PostgreSQL');
        client.release();

        // 2) Tabloları oluştur
        await initTables();
    } catch (err) {
        console.error('Database initialization failed:', err);
        process.exit(1);
    }
}

export default db;