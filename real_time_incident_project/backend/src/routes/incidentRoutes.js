import express from 'express';
import { body } from 'express-validator';
import authenticateToken from '../controllers/authTokenControllers.js';
import * as IncidentController from '../controllers/incidentController.js';

const router = express.Router();

router.get(
    '/',
    authenticateToken,
    IncidentController.getAll
);

router.get(
    '/nearby/:lat/:lng/:radius',
    authenticateToken,
    IncidentController.getNearby
);

router.post(
    '/',
    authenticateToken,
    [
        body('incident_type').trim().notEmpty(),
        body('severity').isIn(['low', 'medium', 'high', 'critical']),
        body('latitude').isFloat({ min: -90, max: 90 }),
        body('longitude').isFloat({ min: -180, max: 180 }),
        body('description').optional().trim()
    ],
    IncidentController.create
);

router.patch(
    '/:id/resolve',
    authenticateToken,
    IncidentController.resolve
);

export default router;

