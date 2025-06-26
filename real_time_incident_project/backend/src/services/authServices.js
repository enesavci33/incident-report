import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import config from '../config/config.js';

export const registerUser = async ({ email, password, name }) => {
    // kullanıcı var mı yok mu kontrol
    const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
        throw new Error('Kullanıcı zaten kayıtlı');
    }
    // şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // kullanıcıyı veritabanına ekle
    const result = await db.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, hashedPassword, name]);
    const user = result.rows[0];

    const token = jwt.sign({ id: user.id }, config.jwtSecret,{ expiresIn: '7d' });

    return { user, token };

}

export const loginUser = async ({ email, password }) => {
    const { rows } = await db.query('SELECT id, email, password, name FROM users WHERE email = $1', [email]);
    if (!rows.length) throw { status: 401, message: 'Geçersiz kimlik bilgileri' };
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) throw { status: 401, message: 'Geçersiz kimlik bilgileri' };

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' } );
    return { user: { id: user.id, email: user.email, name: user.name }, token };
}