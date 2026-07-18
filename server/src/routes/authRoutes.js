import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserById } from '../services/usersService.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev-refresh-secret';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'pm', 'supervisor', 'client-viewer']).default('client-viewer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const createToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, { expiresIn });

const sendAuthCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    // Use lax by default; dev proxy uses same-origin so None isn't required.
    sameSite: 'lax',
    // Local Compose uses HTTP. Set COOKIE_SECURE=true when TLS terminates in production.
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existing = await getUserByEmail(parsed.email);

    if (existing) {
      return res.status(409).json({ data: null, error: 'User already exists', meta: { status: 409 } });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await createUser(parsed.name, parsed.email, passwordHash, parsed.role);

    const accessToken = createToken({ sub: user.id, role: user.role }, JWT_SECRET, '15m');
    const refreshToken = createToken({ sub: user.id, role: user.role }, REFRESH_SECRET, '7d');
    sendAuthCookie(res, refreshToken);

    res.status(201).json({
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
      },
      error: null,
      meta: { status: 201 },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await getUserByEmail(parsed.email);

    if (!user) {
      return res.status(401).json({ data: null, error: 'Invalid credentials', meta: { status: 401 } });
    }

    const valid = await bcrypt.compare(parsed.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ data: null, error: 'Invalid credentials', meta: { status: 401 } });
    }

    const accessToken = createToken({ sub: user.id, role: user.role }, JWT_SECRET, '15m');
    const refreshToken = createToken({ sub: user.id, role: user.role }, REFRESH_SECRET, '7d');
    sendAuthCookie(res, refreshToken);

    res.json({
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
      },
      error: null,
      meta: { status: 200 },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ data: null, error: 'Refresh token missing', meta: { status: 401 } });
    }

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_SECRET);
    } catch (verifyErr) {
      return res.status(401).json({ data: null, error: 'Invalid refresh token', meta: { status: 401 } });
    }
    const user = await getUserById(payload.sub);
    if (!user) return res.status(401).json({ data: null, error: 'User not found', meta: { status: 401 } });
    const accessToken = createToken({ sub: payload.sub, role: payload.role }, JWT_SECRET, '15m');

    res.json({
      data: { accessToken, user },
      error: null,
      meta: { status: 200 },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
