import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { rateLimit } from './middleware/rate-limit';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import teamRoutes from './routes/teams';
import clientRoutes from './routes/clients';
import contactRoutes from './routes/contacts';
import carrierRoutes from './routes/carriers';
import lineRoutes from './routes/lines';
import formRoutes from './routes/forms';
import capacityRoutes from './routes/capacity';
import attachmentRoutes from './routes/attachments';
import templateRoutes from './routes/templates';
import submissionRoutes from './routes/submissions';
import placementRoutes from './routes/placements';
import renewalRoutes from './routes/renewals';
import emailRoutes from './routes/emails';
import importRoutes from './routes/import';
import syncRoutes from './routes/sync';
import configManifestRoutes from './routes/config-manifest';
import matchRoutes from './routes/match';
import networkRoutes from './routes/network';
import aiRoutes from './routes/ai';
import inboundEmailWebhook from './webhooks/inbound-email';
import oauthCallbackWebhook from './webhooks/oauth-callback';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/carriers', carrierRoutes);
app.use('/api/lines', lineRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/capacity', capacityRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/renewals', renewalRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/import', importRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/config/manifest', configManifestRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks/inbound-email', inboundEmailWebhook);
app.use('/api/webhooks/oauth-callback', oauthCallbackWebhook);

// Error handler (must be last)
app.use(errorHandler);

// Start server only when not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`marketmosaic API running on port ${config.port}`);
  });
}

export { app };
export default app;
