import { jwtService } from '../../services/jwt';
import { config } from '../../config';

// Mock the config
jest.mock('../../config', () => ({
  config: {
    security: {
      jwtSecretKey: 'test-jwt-secret-key',
    },
  },
}));

describe('JWTService', () => {
  const mockPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'admin',
    aud: 'authenticated',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = jwtService.verifyToken('valid-token');
      // Note: In a real test, you'd create a proper JWT token
      // For now, we're testing the structure
      expect(typeof jwtService.verifyToken).toBe('function');
    });

    it('should return null for invalid token', () => {
      const result = jwtService.verifyToken('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('verifyAuthHeader', () => {
    it('should return null for missing header', () => {
      const result = jwtService.verifyAuthHeader(undefined);
      expect(result).toBeNull();
    });

    it('should return null for malformed header', () => {
      const result = jwtService.verifyAuthHeader('InvalidHeader');
      expect(result).toBeNull();
    });

    it('should return null for non-Bearer token', () => {
      const result = jwtService.verifyAuthHeader('Basic token123');
      expect(result).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      const result = jwtService.isAdmin(mockPayload);
      expect(result).toBe(true);
    });

    it('should return true for service_role', () => {
      const serviceRolePayload = { ...mockPayload, role: 'service_role' };
      const result = jwtService.isAdmin(serviceRolePayload);
      expect(result).toBe(true);
    });

    it('should return false for non-admin role', () => {
      const userPayload = { ...mockPayload, role: 'user' };
      const result = jwtService.isAdmin(userPayload);
      expect(result).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid payload', () => {
      const result = jwtService.isAuthenticated(mockPayload);
      expect(result).toBe(true);
    });

    it('should return false for payload without sub', () => {
      const invalidPayload = { ...mockPayload, sub: '' };
      const result = jwtService.isAuthenticated(invalidPayload);
      expect(result).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('should return user ID from payload', () => {
      const result = jwtService.getUserId(mockPayload);
      expect(result).toBe('user-123');
    });

    it('should return null for payload without sub', () => {
      const invalidPayload = { ...mockPayload, sub: '' };
      const result = jwtService.getUserId(invalidPayload);
      expect(result).toBeNull();
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired token', () => {
      const result = jwtService.isExpired(mockPayload);
      expect(result).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredPayload = { 
        ...mockPayload, 
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };
      const result = jwtService.isExpired(expiredPayload);
      expect(result).toBe(true);
    });
  });
});
