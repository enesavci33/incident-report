import db from '../database/db.js';

export async function initTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS incidents_type (
            id SERIAL PRIMARY KEY,
            incident_type VARCHAR(100) NOT NULL
            );
  `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
            id             SERIAL PRIMARY KEY,
            email          VARCHAR(255) UNIQUE NOT NULL,
            password       VARCHAR(255) NOT NULL,
            name           VARCHAR(255) NOT NULL,
            profile_image  VARCHAR(500) NOT NULL DEFAULT 'BOS',
            created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
  `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS incidents (
            id             SERIAL PRIMARY KEY,
            user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
            incident_type  INTEGER REFERENCES incidents_type(id) ON DELETE CASCADE,
            severity       VARCHAR(50) NOT NULL,
            latitude       DECIMAL(10,8) NOT NULL,
            longitude      DECIMAL(11,8) NOT NULL,
            address        TEXT,
            description    TEXT,
            image_url      VARCHAR(500),
            report_count   INTEGER DEFAULT 1,
            is_resolved    BOOLEAN DEFAULT FALSE,
            created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
  `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS incident_reports (
            id           SERIAL PRIMARY KEY,
            incident_id  INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
            user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(incident_id, user_id)
            );
  `);

        await db.query(`CREATE INDEX IF NOT EXISTS idx_incidents_location   ON incidents(latitude, longitude);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_incidents_resolved   ON incidents(is_resolved);`);

        console.log('Tablolar başarıyla oluşturuldu veya zaten mevcut.');

    } catch (error) {
        console.error('Tablo oluşturma hatası:', err);
        process.exit(1);
    }
}