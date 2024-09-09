import express from 'express';
import { preventLoggedUser } from "../helpers/auth.js";
import { 
  login, 
  requestReset, 
  validateToken, 
  resetPassword, 
  register,
} from '../controllers/authController.js';
const router = express.Router();


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user by providing first name, last name, email, and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: Registration successful
 *               data:
 *                 id: 1
 *                 firstname: John
 *                 email: johndoe@example.com
 *                 role: user
 *                 createdAt: 2024-08-31T00:00:00.000Z
 *                 emailResponse: success
 *       400:
 *         description: User already exists or invalid input
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Registration failed
 *               errors:
 *                 - message: User already exists
 */
router.post('/register', preventLoggedUser, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Login a user by providing email and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: MySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: Login successful
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       400:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Login failed
 *               errors:
 *                 - message: Invalid password
 *       404:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Login failed
 *               errors:
 *                 - message: User does not exist
 */
router.post('/login', preventLoggedUser, login);

/**
 * @swagger
 * /api/auth/request-reset:
 *   post:
 *     summary: Request password reset
 *     description: Request a password reset by providing the user's email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       201:
 *         description: Password reset mail sent successfully
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: Password Reset Mail sent successfully
 *               data:
 *                 token: 123456
 *                 createdAt: 2024-08-31T00:00:00.000Z
 *                 expiresAt: 2024-09-01T00:00:00.000Z
 *       404:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Change Password Request failed
 *               errors:
 *                 - message: User does not exist
 *       500:
 *         description: Server error or email failed to send
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Change Password Request failed
 *               errors:
 *                 - message: Server failed to send email
 */
router.post('/request-reset', preventLoggedUser, requestReset);

/**
 * //@swagger
 * /api/auth/verification:
 *   get:
 *     summary: Validate email verification token
 *     description: Validate an email verification token by providing the email and token as query parameters.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           example: johndoe@example.com
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: 123456
 *     responses:
 *       200:
 *         description: Token is valid, redirects to login
 *       400:
 *         description: Invalid OTP or OTP expired
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Validation failed
 *               errors:
 *                 - message: Invalid OTP or OTP expired
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */
router.get('/verification', preventLoggedUser, validateToken);

/**
 * @swagger
 * /api/auth/reset-password:
 *   put:
 *     summary: Reset password
 *     description: Reset a user's password by providing email, token, and new password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               token:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: MyNewSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: Password Reset successful
 *               data:
 *                 email: johndoe@example.com
 *       400:
 *         description: Invalid OTP or OTP expired
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Password Reset failed
 *               errors:
 *                 - message: Invalid OTP or OTP expired
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Password Reset failed
 *               errors:
 *                 - message: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Password Reset failed
 *               errors:
 *                 - message: Server error. Something went wrong at updateUser
 */
router.put('/reset-password', preventLoggedUser, resetPassword);

export default router;
