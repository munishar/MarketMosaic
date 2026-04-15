import { Pool, PoolClient } from 'pg';
declare const pool: Pool;
export declare function query(text: string, params?: unknown[]): Promise<import('pg').QueryResult>;
export declare function getClient(): Promise<PoolClient>;
export declare function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
export { pool };
export default pool;
//# sourceMappingURL=connection.d.ts.map