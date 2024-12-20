import express from 'express';
import { addToWaitlistNow } from '../controllers/waitlistController';
// import { preventLoggedUser } from '../middlewares/auth.js';

const router = express.Router();

// router.post('/add-waitlist', preventLoggedUser, addToWaitlistNow);
router.post('/add-waitlist', addToWaitlistNow);
export default router;

// /**
//  * //@swagger
//  * components:
//  *   schemas:
//  *     WaitlistRequest:
//  *       type: object
//  *       required:
//  *         - email
//  *       properties:
//  *         email:
//  *           type: string
//  *           description: The user's email address to be added to the waitlist
//  *       example:
//  *         email: user@example.com
//  *
//  *     WaitlistResponse:
//  *       type: object
//  *       properties:
//  *         message:
//  *           type: string
//  *           description: Response message indicating the status of the waitlist request
//  *
//  * /api/waitlist/add-waitlist:
//  *   post:
//  *     summary: Add a user to the waitlist
//  *     description: Adds a user's email to the waitlist and sends a confirmation email
//  *     tags: [Waitlist]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/WaitlistRequest'
//  *     responses:
//  *       200:
//  *         description: Waitlist Mail sent successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/WaitlistResponse'
//  *       400:
//  *         description: Something went wrong. Unable to send email. Try again
//  *       500:
//  *         description: Internal Server Error
//  */
