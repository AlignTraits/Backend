import express from 'express';
import { createCommunity, getCommunities, createPost, getPosts } from '../controllers/communityController.js';

const router = express.Router();

router.post('/', createCommunity);
router.get('/', getCommunities);
router.post('/:communityId/posts', createPost);
router.get('/:communityId/posts', getPosts);

/**
 * @swagger
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the community
 *         name:
 *           type: string
 *           description: The name of the community
 *         description:
 *           type: string
 *           description: The description of the community
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the community was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the community was last updated
 *       example:
 *         id: d5fE_asz
 *         name: LearnConnect Community
 *         description: A place to connect and learn together
 *         createdAt: 2023-10-01T00:00:00.000Z
 *         updatedAt: 2023-10-01T00:00:00.000Z
 *
 * /api/communities:
 *   post:
 *     summary: Create a new community
 *     tags: [Community]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Community'
 *     responses:
 *       201:
 *         description: The community was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Community'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Returns the list of all the communities
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: The list of the communities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Community'
 *       500:
 *         description: Some server error
 *
 * /api/communities/{communityId}/posts:
 *   post:
 *     summary: Create a new post in a community
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the community
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Returns the list of all the posts in a community
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the community
 *     responses:
 *       200:
 *         description: The list of the posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Some server error
 */
export default router;
