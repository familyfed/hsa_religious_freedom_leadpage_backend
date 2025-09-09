import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface JWTPayload {
  sub: string; // User ID
  email?: string;
  role?: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
}

export class JWTService {
  private readonly jwksClient: jwksClient.JwksClient;
  private readonly issuer: string;

  constructor() {
    this.issuer = config.supabase.url;
    
    // Initialize JWKS client for Supabase
    this.jwksClient = jwksClient({
      jwksUri: `${this.issuer}/auth/v1/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 5
    });
  }

  /**
   * Get signing key from JWKS
   */
  private async getSigningKey(kid: string): Promise<string> {
    try {
      const key = await this.jwksClient.getSigningKey(kid);
      return key.getPublicKey();
    } catch (error) {
      logger.error('Failed to get signing key', { kid, error });
      throw new Error('Unable to find a signing key that matches');
    }
  }

  /**
   * Verify a JWT token and return the payload
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      // Decode header to get kid
      const decodedHeader = jwt.decode(token, { complete: true });
      if (!decodedHeader || typeof decodedHeader === 'string') {
        throw new Error('Invalid token format');
      }

      const kid = decodedHeader.header.kid;
      if (!kid) {
        throw new Error('Token missing key ID');
      }

      // Get the signing key
      const signingKey = await this.getSigningKey(kid);

      // Verify the token
      const decoded = jwt.verify(token, signingKey, {
        issuer: this.issuer,
        audience: 'authenticated',
        algorithms: ['RS256']
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      logger.warn('JWT verification failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 10) + '...'
      });
      return null;
    }
  }

  /**
   * Verify a JWT token from Authorization header
   */
  async verifyAuthHeader(authHeader: string | undefined): Promise<JWTPayload | null> {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return await this.verifyToken(parts[1]);
  }

  /**
   * Check if user has admin role
   */
  isAdmin(payload: JWTPayload): boolean {
    return payload.role === 'admin' || payload.role === 'service_role';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(payload: JWTPayload): boolean {
    return !!payload.sub && payload.exp > Date.now() / 1000;
  }

  /**
   * Get user ID from payload
   */
  getUserId(payload: JWTPayload): string | null {
    return payload.sub || null;
  }

  /**
   * Check if token is expired
   */
  isExpired(payload: JWTPayload): boolean {
    return payload.exp <= Date.now() / 1000;
  }
}

export const jwtService = new JWTService();
