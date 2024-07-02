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