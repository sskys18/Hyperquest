import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import { questsRouter } from './api/quests.route';
import { walletsRouter } from './api/wallets.route';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'hyperliquid-quest-backend', time: new Date().toISOString() });
});

app.use('/v1/quests', questsRouter);
app.use('/v1/wallets', walletsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
