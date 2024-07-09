import { db } from "../helpers/db.js";

export const createCommunity = async (req, res) => {
  const { name, description } = req.body;
  try {
    const community = await db.community.create({
      data: { name, description },
    });
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getCommunities = async (req, res) => {
  try {
    const communities = await db.community.findMany();
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createPost = async (req, res) => {
  const { title, content, communityId } = req.body;
  try {
    const post = await db.post.create({
      data: { title, content, communityId },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getPosts = async (req, res) => {
  const { communityId } = req.params;
  try {
    const posts = await db.post.findMany({
      where: { communityId },
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
