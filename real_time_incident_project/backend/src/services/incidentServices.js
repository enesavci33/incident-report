import axios from 'axios';
import db from '../database/db.js';

export async function getAllIncidents() {
    const { rows } = await db.query(`
        SELECT i.*, u.name AS reporter_name
        FROM incidents i
        JOIN users u ON i.user_id = u.id
        WHERE i.is_resolved = FALSE
        ORDER BY i.created_at DESC
     `);
    return rows;
}

export async function getNearbyIncidents(lat, lng, radiusInKm = 10) {
    const { rows } = await db.query(`
        SELECT i.*, u.name AS reporter_name,
        (6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
        )) AS distance
        FROM incidents i
        JOIN users u ON i.user_id = u.id
        WHERE i.is_resolved = FALSE
        HAVING distance < $3
        ORDER BY distance
    `, [lat, lng, radiusInKm]);
    return rows;
}

export async function createOrReportIncident({ incident_type,
    severity,
    latitude,
    longitude,
    description,
    image_url }, userId) {
    // opsiyonel 
    let address = null;
    // if (GEOCODING_API_KEY) {
    //     try {
    //         const geo = await axios.get(
    //             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GEOCODING_API_KEY}`
    //         );
    //         if (geo.data.results.length) {
    //             address = geo.data.results[0].formatted_address;
    //         }
    //     } catch { /* hata yoksay */ }
    // }

    //100 m içinde benzer bir açık olay var mı kontrolü
    const nearBy = await db.query(`
    SELECT id FROM incidents
    WHERE is_resolved = FALSE
      AND incident_type = $1
      AND (6371000 * acos(
         cos(radians($2)) * cos(radians(latitude)) *
         cos(radians(longitude) - radians($3)) +
         sin(radians($2)) * sin(radians(latitude))
      )) < 100
  `, [incident_type, latitude, longitude]);

    let incidentId;
    let isNewIncident = true;

    if (nearBy.rows.length) {
        incidentId = nearBy.rows[0].id;

        // Aynı kullanıcı zaten raporladı mı?
        const rep = await db.query(
            'SELECT 1 FROM incident_reports WHERE incident_id=$1 AND user_id=$2',
            [incidentId, userId]
        );
        if (rep.rows.length) {
            const err = new Error('Bu olayı daha önce bildirdiniz');
            err.status = 400;
            throw err;
        }

        // Rapor ekle ve sayaç güncelle
        await db.query(
            'INSERT INTO incident_reports (incident_id,user_id) VALUES($1,$2)',
            [incidentId, userId]
        );
        await db.query(
            'UPDATE incidents SET report_count = report_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id=$1',
            [incidentId]
        );

        isNewIncident = false;
    }
    else {
        const ins = await db.query(`
            INSERT INTO incidents (user_id,incident_type,severity,latitude,longitude,address,description,image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [userId, incident_type, severity, latitude, longitude, address, description, image_url]);

        incidentId = ins.rows[0].id;

        // İlk raporu ekle
        await db.query(
            'INSERT INTO incident_reports (incident_id,user_id) VALUES($1,$2)',
            [incidentId, userId]
        );
    }
    // c) Güncel olay verisini döndür
    const { rows } = await db.query(`
    SELECT i.*, u.name AS reporter_name
    FROM incidents i
    JOIN users u ON i.user_id = u.id
    WHERE i.id = $1
  `, [incidentId]);

    return { incident: rows[0], isNewIncident };
}

//  Olayı çözülmüş işaretleme
export async function resolveIncidentById(id) {
    const check = await db.query(
        'SELECT 1 FROM incidents WHERE id=$1 AND is_resolved=FALSE',
        [id]
    );
    if (!check.rows.length) {
        const err = new Error('Olay bulunamadı veya zaten çözüldü');
        err.status = 404;
        throw err;
    }
    await db.query(
        'UPDATE incidents SET is_resolved=TRUE, updated_at=CURRENT_TIMESTAMP WHERE id=$1',
        [id]
    );
}