// routes/skillRoutes.ts
import express from 'express';
import { adminLoginRequired } from '../middlewares/auth';
import {
  createSkillController,
  deleteSkillController,
} from '../controllers/skillController';
import MessageResponse from '../types/messageResponse';

const router = express.Router();

// Create a new skill (admin-only)
router.post<{}, MessageResponse>(
  '/create-skill',
  adminLoginRequired,
  createSkillController
);

// Delete a skill by ID (admin-only)
router.delete<{}, MessageResponse>(
  '/delete/:id',
  adminLoginRequired,
  deleteSkillController
);

export default router;
