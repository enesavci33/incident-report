import { Pool } from 'pg';
import appConfig from '../config/config.js';
import 'dotenv/config';


const pool = new Pool({
    host: appConfig.postgres.host,
    port: appConfig.postgres.port,
    user: appConfig.postgres.user,
    password: appConfig.postgres.password,
    database: appConfig.postgres.database,
});



export default pool;