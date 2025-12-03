import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

/**
 * POST /
 * Create a new review
 */
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { bookId, rating, title, content, isSpoiler } = req.body;

    const review = await prisma.review.create({
      data: {
        userId,
        bookId,
        rating,
        title,
        content,
        isSpoiler: !!isSpoiler,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

/**
 * GET /:id
 * Get a review by ID
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, fullName: true, profileImageUrl: true } },
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { id: true, username: true, fullName: true, profileImageUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!review) return res.status(404).json({ error: 'Review not found' });

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

/**
 * PUT /:id
 * Update a review
 */
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, title, content, isSpoiler } = req.body;

    const existingReview = await prisma.review.findUnique({ where: { id } });
    if (!existingReview) return res.status(404).json({ error: 'Review not found' });
    if (existingReview.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, title, content, isSpoiler: !!isSpoiler },
    });

    res.json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

/**
 * DELETE /:id
 * Delete a review
 */
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existingReview = await prisma.review.findUnique({ where: { id } });
    if (!existingReview) return res.status(404).json({ error: 'Review not found' });
    if (existingReview.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.review.delete({ where: { id } });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

/**
 * POST /:id/like
 * Like or unlike a review
 */
router.post('/:id/like', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id: reviewId } = req.params;

    const existingLike = await prisma.reviewLike.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });

    if (existingLike) {
      // Unlike
      await prisma.reviewLike.delete({ where: { id: existingLike.id } });
      return res.json({ message: 'Review unliked' });
    } else {
      // Like
      await prisma.reviewLike.create({ data: { userId, reviewId } });
      return res.json({ message: 'Review liked' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to like/unlike review' });
  }
});

/**
 * POST /:id/comments
 * Add comment to a review
 */
router.post('/:id/comments', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id: reviewId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string') return res.status(400).json({ error: 'Content is required' });

    const comment = await prisma.reviewComment.create({
      data: { userId, reviewId, content },
    });

    // Increment comment count in Review
    await prisma.review.update({
      where: { id: reviewId },
      data: { commentsCount: { increment: 1 } },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * GET /:id/comments
 * Get comments for a review
 */
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const { id: reviewId } = req.params;

    const comments = await prisma.reviewComment.findMany({
      where: { reviewId },
      include: { user: { select: { id: true, username: true, fullName: true, profileImageUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;
