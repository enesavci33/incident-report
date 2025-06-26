import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import appConfig from '../config/config.js';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Erişim token ı gereklii' });
    }

    try {
        const decoded = jwt.verify(token, appConfig.jwtSecret);
        const userResult = await db.query(
            'SELECT id, email, name FROM users WHERE id = $1',
            [decoded.userId]
        );
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı geçersiz token' });
        }

        req.user = userResult.rows[0];
        next();

    } catch (error) {
        return res.status(403).json({ error: 'Geçersiz token' });

    }
}

export default authenticateToken;