import { Request, Response, NextFunction } from 'express';
import { checkPermission, getRowFilter, CrudAction } from '../lib/permissions';
import { UserRole } from '@marketmosaic/shared';

export function authorize(entity: string, action: CrudAction) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    if (!checkPermission(user.role as UserRole, entity, action)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: `Insufficient permissions for ${action} on ${entity}` } });
      return;
    }

    const rowFilter = getRowFilter(user.role as UserRole, entity);
    if (rowFilter) {
      req.rowFilter = rowFilter;
    }

    next();
  };
}
