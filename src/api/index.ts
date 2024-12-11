import express from 'express';

import MessageResponse from '../types/messageResponse';
import UserRoutes from '../routes/userRoutes';
import AuthRoutes from '../routes/authRoutes';
import surveyRoutes from '../routes/surveryRoutes';
import schoolRoutes from '../routes/schoolRoutes';
// import WaitlistRoutes from '../routes/waitlistRoutes'

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'AlignTraits API v1 - 👋🌎🌍🌏',
  });
});

router.use('/users', UserRoutes);
router.use('/auth', AuthRoutes);
router.use('/school', schoolRoutes);
router.use('/survey', surveyRoutes);
// router.use('/waitlist', WaitlistRoutes)

export default router;
