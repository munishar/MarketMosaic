import { Request, Response, NextFunction } from 'express';
import { query } from '@marketmosaic/db';

export function auditLog(entityType: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown): Response {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const userId = req.user?.user_id ?? null;
        const action = `${req.method} ${req.path}`;
        let entityId: string | null = req.params.id ?? null;

        if (!entityId && body && typeof body === 'object') {
          const data = (body as Record<string, unknown>).data;
          if (data && typeof data === 'object') {
            entityId = ((data as Record<string, unknown>).id as string) ?? null;
          }
        }

        if (entityId) {
          query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address) VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, action, entityType, entityId, JSON.stringify(req.body), req.ip ?? null]
          ).catch((err: unknown) => {
            console.error('Audit log error:', err);
          });
        }
      }

      return originalJson(body);
    };

    next();
  };
}
