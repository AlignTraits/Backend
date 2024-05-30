import express from 'express';
import { login, requestReset, validateOtp, resetPassword, register } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: User sign up
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/signup', register);

/**
 * @swagger
 * /api/users/login:
 *  post:
 *   summary: User login
 *   description: Authenticate a user
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        email:
 *         type: string
 *        password:
 *        type: string
 *   responses:
 *    200:
 *     description: User authenticated
 *    400:
 *     description: Invalid credentials
 *    404:
 *     description: User not found
 *    500:
 *     description: Internal server error
 */
router.post('/login', login);

// send an email with an otp
router.post('/request-reset', requestReset);

// once you write in that otp into that form
router.post('/validate-otp', validateOtp);

// write into the form that actually changes te password
router.put('/reset-password', resetPassword);

export default router;
