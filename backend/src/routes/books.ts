import express from 'express';
import { optionalAuth } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

/**
 * GET /search
 * Search books by title, author, or genre
 */
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Query parameter "q" is required' });

    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          { genre: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20, // limit results
      orderBy: { title: 'asc' },
    });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

/**
 * GET /:id
 * Get book details by ID (with reviews)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { id: true, username: true, fullName: true, profileImageUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!book) return res.status(404).json({ error: 'Book not found' });

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch book details' });
  }
});

/**
 * GET /popular
 * Get popular books by average rating or total reviews
 */
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: [
        { avgRating: 'desc' },
        { totalReviews: 'desc' },
      ],
      take: 20,
    });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch popular books' });
  }
});

export default router;
