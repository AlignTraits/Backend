import express from 'express';
import { login, requestReset, validateOtp, resetPassword, register, requestOtp } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         email: user@example.com
 *         password: userPassword123
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: The registered user's email address
 *
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', register);

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         email: user@example.com
 *         password: userPassword123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The JWT token for authenticating the user
 *
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user and returns a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

/**
 * @swagger
 * components:
 *   schemas:
 *     RequestReset:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user requesting the password reset
 *       example:
 *         email: user@example.com
 *
 *     RequestResetResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *         otp:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: OTP token
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Token creation time
 *             expiresAt:
 *               type: string
 *               format: date-time
 *               description: Token expiration time
 *
 * /api/users/request-reset:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset OTP to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestReset'
 *     responses:
 *       200:
 *         description: Reset link mail sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestResetResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/request-reset', requestReset);

/**
 * @swagger
 * components:
 *   schemas:
 *     RequestOtp:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: The email address to send the OTP to
 *       example:
 *         email: user@example.com
 *
 *     RequestOtpResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *         otp:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: OTP token
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Token creation time
 *             expiresAt:
 *               type: string
 *               format: date-time
 *               description: Token expiration time
 *
 * /api/users/request-otp:
 *   post:
 *     summary: Request an OTP
 *     description: Generates and sends an OTP to the specified email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestOtp'
 *     responses:
 *       200:
 *         description: OTP sent to your email address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestOtpResponse'
 *       400:
 *         description: Bad request, unable to send email
 *       500:
 *         description: Internal server error
 */
router.post('/request-otp', requestOtp);

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidateOtp:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           description: The email address associated with the OTP
 *         otp:
 *           type: string
 *           description: The OTP to validate
 *       example:
 *         email: user@example.com
 *         otp: 123456
 *
 *     ValidateOtpResponse:
 *       type: object
 *       properties:
 *         valid:
 *           type: boolean
 *           description: Indicates whether the OTP is valid
 *         message:
 *           type: string
 *           description: Response message
 *
 * /api/users/validate-otp:
 *   post:
 *     summary: Validate an OTP
 *     description: Validates the provided OTP for the given email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateOtp'
 *     responses:
 *       200:
 *         description: OTP is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidateOtpResponse'
 *       400:
 *         description: Invalid OTP or OTP expired
 *       500:
 *         description: Internal server error
 */
router.post('/validate-otp', validateOtp);

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           description: The email address associated with the account
 *         otp:
 *           type: string
 *           description: The OTP for verifying the password reset request
 *         newPassword:
 *           type: string
 *           description: The new password to set for the account
 *       example:
 *         email: user@example.com
 *         otp: 123456
 *         newPassword: newStrongPassword123
 *
 *     ResetPasswordResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *         email:
 *           type: string
 *           description: The email address associated with the account
 *
 * /api/users/reset-password:
 *   put:
 *     summary: Reset user password
 *     description: Resets the password for the user associated with the provided email and OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordResponse'
 *       400:
 *         description: Invalid OTP or OTP expired
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/reset-password', resetPassword);

export default router;
