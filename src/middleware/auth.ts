import { Request, Response, NextFunction } from 'express';
import { jwtService, JWTPayload } from '../services/jwt';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * JWT Authentication middleware
 * Verifies JWT token and adds user info to request
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const payload = await jwtService.verifyAuthHeader(authHeader);

    if (!payload) {
      res.status(401).json({
        ok: false,
        error: 'Invalid or missing authentication token'
      });
      return;
    }

    if (jwtService.isExpired(payload)) {
      res.status(401).json({
        ok: false,
        error: 'Token has expired'
      });
      return;
    }

    if (!jwtService.isAuthenticated(payload)) {
      res.status(401).json({
        ok: false,
        error: 'Invalid authentication token'
      });
      return;
    }

    // Add user info to request
    req.user = payload;
    next();
  } catch (error) {
    logger.error('JWT authentication error', { error, url: req.url });
    res.status(500).json({
      ok: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Admin authentication middleware
 * Requires admin role in JWT token
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      ok: false,
      error: 'Authentication required'
    });
    return;
  }

  if (!jwtService.isAdmin(req.user)) {
    logger.warn('Admin access denied', { 
      userId: req.user.sub, 
      role: req.user.role,
      url: req.url 
    });
    res.status(403).json({
      ok: false,
      error: 'Admin access required'
    });
    return;
  }

  next();
};

/**
 * Optional JWT authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const payload = await jwtService.verifyAuthHeader(authHeader);

    if (payload && !jwtService.isExpired(payload) && jwtService.isAuthenticated(payload)) {
      req.user = payload;
    }

    next();
  } catch (error) {
    logger.warn('Optional JWT authentication failed', { error, url: req.url });
    next(); // Continue without authentication
  }
};
