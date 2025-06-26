import express from 'express';
import { body } from 'express-validator';
import * as AuthController from '../controllers/authController.js';


const router = express.Router();
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('name').trim().isLength({ min: 2 })
    ],
    AuthController.register
);

router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ],
    AuthController.login
);

export default router;
