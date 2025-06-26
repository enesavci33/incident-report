import { validationResult } from 'express-validator';
import * as AuthService from '../services/authServices.js';

export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { user, token } = await AuthService.registerUser(req.body);
        return res.status(201).json({
            message: 'Kullanıcı kaydı başarılı',
            user,
            token
        });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || 'Sunucu hatası';
        return res.status(status).json({ error: message });
    }
}

export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        
        const { user, token } = await AuthService.loginUser(req.body);
        return res.json({
            message: 'Giriş Başarılı',
            user,
            token
        });
    } catch (err) {
        // 3) Hata durumunu uniforme yakala
        const status = err.status || 500;
        const message = err.message || 'Sunucu hatası';
        return res.status(status).json({ error: message });
    }
}
