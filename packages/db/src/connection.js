import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/marketmosaic',
    max: 20,
});
export async function query(text, params) {
    return pool.query(text, params);
}
export async function getClient() {
    return pool.connect();
}
export async function transaction(fn) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
export { pool };
export default pool;
//# sourceMappingURL=connection.js.map