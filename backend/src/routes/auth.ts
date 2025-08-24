import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../server';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 50 }).isAlphanumeric(),
  body('password').isLength({ min: 6 }),
  body('fullName').optional().isLength({ max: 100 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullName }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists with this email or username' 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        profileImageUrl: true
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || undefined,
        profileImageUrl: user.profileImageUrl || undefined
      },
      token
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || undefined,
        profileImageUrl: user.profileImageUrl || undefined
      },
      token
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Logout (client-side token removal mainly, but we can blacklist tokens if needed)
router.post('/logout', (_req: any, res: any) => {
  // For now, just return success - client should remove token
  res.json({ message: 'Logged out successfully' });
});

// Get current user profile
router.get('/me', async (req: any, res: any) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        profileImageUrl: true,
        interests: true,
        websiteUrl: true,
        twitterHandle: true,
        instagramHandle: true,
        isVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;