import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

/**
 * GET /:username
 * Get user profile by username
 */
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        bio: true,
        profileImageUrl: true,
        interests: true,
        websiteUrl: true,
        twitterHandle: true,
        instagramHandle: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        followers: { select: { followerId: true } },
        following: { select: { followingId: true } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * PUT /profile
 * Update authenticated user profile
 */
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { fullName, bio, interests, websiteUrl, twitterHandle, instagramHandle } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        bio,
        interests,
        websiteUrl,
        twitterHandle,
        instagramHandle,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /:username/follow
 * Follow or unfollow a user
 */
router.post('/:username/follow', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.params;

    const targetUser = await prisma.user.findUnique({ where: { username } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.id === userId) return res.status(400).json({ error: 'Cannot follow yourself' });

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId: targetUser.id } },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      return res.json({ message: 'Unfollowed user' });
    } else {
      // Follow
      await prisma.follow.create({
        data: { followerId: userId, followingId: targetUser.id },
      });
      return res.json({ message: 'Followed user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to follow/unfollow user' });
  }
});

/**
 * GET /:username/followers
 * Get list of followers for a user
 */
router.get('/:username/followers', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      include: { followers: { include: { follower: true } } },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const followers = user.followers.map(f => ({
      id: f.follower.id,
      username: f.follower.username,
      fullName: f.follower.fullName,
      profileImageUrl: f.follower.profileImageUrl,
    }));

    res.json(followers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

/**
 * GET /:username/following
 * Get list of users that this user is following
 */
router.get('/:username/following', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      include: { following: { include: { following: true } } },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const following = user.following.map(f => ({
      id: f.following.id,
      username: f.following.username,
      fullName: f.following.fullName,
      profileImageUrl: f.following.profileImageUrl,
    }));

    res.json(following);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

export default router;
