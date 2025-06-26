import { validationResult } from 'express-validator';
import * as IncidentService from '../services/incidentServices.js';

export const getAll = async (req, res) => {
    try {
        const rows = await IncidentService.getAllIncidents();
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Sunucu hatası' });
    }
};

export const getNearby = async (req, res) => {
    try {
        const { lat, lng, radius } = req.params;
        const rows = await IncidentService.getNearbyIncidents(
            parseFloat(lat),
            parseFloat(lng),
            parseFloat(radius) || 10
        );
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Sunucu hatası' });
    }
};

export const create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { incident, isNewIncident } =
            await IncidentService.createOrReportIncident(req.body, req.user.id);

        req.io.emit('new_incident', { incident, isNewIncident });

        return res.status(201).json({
            message: isNewIncident
                ? 'Olay başarıyla oluşturuldu'
                : 'Olay raporu başarıyla eklendi',
            incident
        });
    } catch (err) {
        console.error(err);
        const status = err.status || 500;
        const message = err.message || 'Sunucu hatası';
        return res.status(status).json({ error: message });
    }
};

export const resolve = async (req, res) => {
    try {
        const { id } = req.params;
        await IncidentService.resolveIncidentById(id);

        req.io.emit('incident_resolved', { incidentId: id });
        return res.json({ message: 'Incident resolved successfully' });
    } catch (err) {
        console.error(err);
        const status = err.status || 500;
        const message = err.message || 'Internal server error';
        return res.status(status).json({ error: message });
    }
};