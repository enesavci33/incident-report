import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

import { connectDatabase } from './database/databaseIndex.js';  // yeni
import authRoutes from './routes/authRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());
app.use((req, res, next) => {
    req.io = io;
    next();
});

await connectDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);

io.on('connection', socket => {
    console.log('kullanici bağlandi', socket.id);
    socket.on('join_room', () => socket.join('incidents'));
    socket.on('disconnect', () => console.log('kullanici bağlantisi kesildi:', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));