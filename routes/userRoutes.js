import express from 'express';
import { loginRequired } from "../helpers/auth.js";
import { 
  getUserData,
  updateUserProfile,
  uploadUserPicture
} from '../controllers/userController.js';
import { upload } from '../helpers/upload.js';
const router = express.Router();


/**
 * @swagger
 * api/user/:
 *   get:
 *     summary: Get user data
 *     description: Retrieve user data by providing the user ID as a path parameter. Additional details can be passed as query parameters.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: User found
 *               data:
 *                 user: 
 *                   id: 1
 *                   firstname: John
 *                   lastname: Doe
 *                   email: johndoe@example.com
 *                   role: user
 *                   createdAt: 2024-08-31T00:00:00.000Z
 *       401:
 *         description: Access denied
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Access denied
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: User not found
 *               errors:
 *                 - message: User does not exist
 */
router.get('/:id', loginRequired, getUserData);

/**
 * @swagger
 * /api/user/:
 *   put:
 *     summary: Update user profile
 *     description: Update a user's profile by providing the user ID and new data.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 1
 *               data:
 *                 type: object
 *                 example: 
 *                   firstname: Jane
 *                   lastname: Smith
 *                   email: janesmith@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: User updated successfully
 *               data:
 *                 updatedUser:
 *                   id: 1
 *                   firstname: Jane
 *                   lastname: Smith
 *                   email: janesmith@example.com
 *                   role: user
 *                   updatedAt: 2024-08-31T00:00:00.000Z
 *       401:
 *         description: Access denied
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Access denied
 *       500:
 *         description: Update failed due to server error
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Update failed
 *               errors:
 *                 - message: Server error. Something went wrong at updateUserProfile
 */
router.put('/', loginRequired, updateUserProfile);

/**
 * @swagger
 * /api/user/upload-picture:
 *   put:
 *     summary: Upload user profile picture
 *     description: Upload a profile picture for a user by providing the user ID and the image file.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 1
 *               profile:
 *                 type: string
 *                 format: binary
 *                 description: The profile picture file to upload
 *     responses:
 *       200:
 *         description: User picture uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: User picture uploaded successfully
 *               data:
 *                 updatedUser:
 *                   id: 1
 *                   firstname: John
 *                   lastname: Doe
 *                   email: johndoe@example.com
 *                   profilePicture: https://storage.googleapis.com/bucket_name/profile_picture.png
 *                   updatedAt: 2024-08-31T00:00:00.000Z
 *       400:
 *         description: File upload failed
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: File upload failed
 *               errors:
 *                 - message: No file uploaded
 *       401:
 *         description: Access denied
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Access denied
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: User not found
 *               errors:
 *                 - message: User does not exist
 *       500:
 *         description: Update failed due to server error
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Update failed
 *               errors:
 *                 - message: Server error. Something went wrong at uploadUserPicture
 */
router.put('/upload-picture', loginRequired, upload.single('profile'), uploadUserPicture);

export default router;
