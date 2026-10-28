import express, { NextFunction, Request, Response } from 'express';
import { ambassadorApplication, pilotRequest } from '../controllers/formsController';

/*
  Public website forms, no login needed:
    POST /api/v1/forms/ambassador
    POST /api/v1/forms/pilot
*/
const router = express.Router();

/* A small per-address limit, so the forms cannot be flooded: 5 submissions per 10 minutes. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function limit(req: Request, res: Response, next: NextFunction) {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    res.status(429).json({ ok: false, message: 'Too many tries. Please wait a few minutes and try again.' });
    return;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // keep memory small
  next();
}

router.post('/ambassador', limit, ambassadorApplication);
router.post('/pilot', limit, pilotRequest);

export default router;
