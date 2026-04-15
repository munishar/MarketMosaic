import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { listQueryParamsSchema } from '@brokerflow/shared';
import * as attachmentService from '../services/attachment.service';
import { AppError } from '../middleware/error-handler';

const router = Router();
const apiRateLimit = rateLimit(60 * 1000, 60);

// Multer: store file in memory (we immediately stream to storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// POST /attachments/upload
router.post(
  '/upload',
  apiRateLimit,
  authenticate,
  authorize('attachment', 'create'),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(new AppError(400, 'MISSING_FILE', 'No file provided'));
      }
      const meta = req.body as Record<string, unknown>;
      const attachment = await attachmentService.upload(
        {
          originalname: req.file.originalname,
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        meta,
        req.user!.user_id,
      );
      res.status(201).json({ data: attachment });
    } catch (error) {
      next(error);
    }
  },
);

// GET /attachments
router.get(
  '/',
  apiRateLimit,
  authenticate,
  authorize('attachment', 'read'),
  validate(listQueryParamsSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await attachmentService.list(req.query as Record<string, unknown>);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

// GET /attachments/by-client/:clientId
router.get(
  '/by-client/:clientId',
  apiRateLimit,
  authenticate,
  authorize('attachment', 'read'),
  validate(listQueryParamsSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await attachmentService.getByClientId(
        req.params.clientId,
        req.query as Record<string, unknown>,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

// GET /attachments/:id
router.get(
  '/:id',
  apiRateLimit,
  authenticate,
  authorize('attachment', 'read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attachment = await attachmentService.getById(req.params.id);
      res.json({ data: attachment });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /attachments/:id
router.delete(
  '/:id',
  apiRateLimit,
  authenticate,
  authorize('attachment', 'delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await attachmentService.remove(req.params.id);
      res.json({ data: { message: 'Attachment deleted' } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
