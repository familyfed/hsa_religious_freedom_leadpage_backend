import request from 'supertest';
import app from '../../index';

// Mock the database service
jest.mock('../../database/supabase', () => ({
  db: {
    getPetitionBySlug: jest.fn(),
    createSignature: jest.fn(),
    getSignatureByEmailAndPetition: jest.fn(),
    getRecentSignaturesByEmail: jest.fn(),
  },
}));

// Mock the security service
jest.mock('../../services/security', () => ({
  securityService: {
    verifyTurnstileToken: jest.fn(),
    generateConfirmToken: jest.fn(),
    hashData: jest.fn(),
    isDisposableEmail: jest.fn(),
    validateEmail: jest.fn(),
  },
}));

// Mock the email service
jest.mock('../../services/email', () => ({
  emailService: {
    sendConfirmationEmail: jest.fn(),
  },
}));

import { db } from '../../database/supabase';
import { securityService } from '../../services/security';
import { emailService } from '../../services/email';

const mockDb = db as jest.Mocked<typeof db>;
const mockSecurityService = securityService as jest.Mocked<typeof securityService>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;

describe('POST /api/petitions/:slug/sign', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockDb.getPetitionBySlug.mockResolvedValue({
      id: 'petition-1',
      slug: 'test-petition',
      title: 'Test Petition',
      goal_count: 1000,
      is_public: true,
      created_at: '2025-01-27T00:00:00Z',
    });
    
    mockSecurityService.verifyTurnstileToken.mockResolvedValue(true);
    mockSecurityService.validateEmail.mockReturnValue(true);
    mockSecurityService.isDisposableEmail.mockReturnValue(false);
    mockSecurityService.generateConfirmToken.mockReturnValue('test-token');
    mockSecurityService.hashData.mockReturnValue('hashed-data');
    
    mockDb.getSignatureByEmailAndPetition.mockResolvedValue(null);
    mockDb.getRecentSignaturesByEmail.mockResolvedValue(0);
    mockDb.createSignature.mockResolvedValue({
      id: 'signature-1',
      petition_id: 'petition-1',
      email: 'test@example.com',
      full_name: 'Test User',
      country: 'US',
      consent_news: true,
      status: 'pending',
      confirm_token: 'test-token',
      ip_hash: 'hashed-ip',
      ua_hash: 'hashed-ua',
      created_at: '2025-01-27T00:00:00Z',
    });
    
    mockEmailService.sendConfirmationEmail.mockResolvedValue(true);
  });

  it('should successfully sign a petition', async () => {
    const response = await request(app)
      .post('/api/petitions/test-petition/sign')
      .send({
        email: 'test@example.com',
        full_name: 'Test User',
        country: 'US',
        consent_news: true,
        turnstileToken: 'test-turnstile-token',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(mockDb.createSignature).toHaveBeenCalled();
    expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalled();
  });

  it('should return 404 for non-existent petition', async () => {
    mockDb.getPetitionBySlug.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/petitions/non-existent/sign')
      .send({
        email: 'test@example.com',
        full_name: 'Test User',
        country: 'US',
        consent_news: true,
        turnstileToken: 'test-turnstile-token',
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ ok: false, error: 'Petition not found' });
  });

  it('should return 400 for invalid email', async () => {
    mockSecurityService.validateEmail.mockReturnValue(false);

    const response = await request(app)
      .post('/api/petitions/test-petition/sign')
      .send({
        email: 'invalid-email',
        full_name: 'Test User',
        country: 'US',
        consent_news: true,
        turnstileToken: 'test-turnstile-token',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ ok: false, error: 'Invalid email format' });
  });

  it('should return 400 for disposable email', async () => {
    mockSecurityService.isDisposableEmail.mockReturnValue(true);

    const response = await request(app)
      .post('/api/petitions/test-petition/sign')
      .send({
        email: 'test@tempmail.com',
        full_name: 'Test User',
        country: 'US',
        consent_news: true,
        turnstileToken: 'test-turnstile-token',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ ok: false, error: 'Disposable email addresses are not allowed' });
  });

  it('should return 400 for failed Turnstile verification', async () => {
    mockSecurityService.verifyTurnstileToken.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/petitions/test-petition/sign')
      .send({
        email: 'test@example.com',
        full_name: 'Test User',
        country: 'US',
        consent_news: true,
        turnstileToken: 'invalid-token',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ ok: false, error: 'Bot check failed' });
  });

  it('should return 409 for duplicate pending signature', async () => {
    mockDb.getSignatureByEmailAndPetition.mockResolvedValue({
      id: 'existing-signature',
      petition_id: 'petition-1',
      email: 'test@example.com',
      full_name: 'Test User',
      country: 'US',
      consent_news: true,
      status: 'pending',
      confirm_token: 'existing-token',
      ip_hash: 'hashed-ip',
      ua_hash: 'hashed-ua',
      created_at: '2025-01-27T00:00:00Z',
    });

    const response = await request(app)
      .post('/api/petitions/test-petition/sign')
      .send({
        email: 'test@example.com',
        full_name: 'Test User',
        country: 'US',
        consent_news: true,
        turnstileToken: 'test-turnstile-token',
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ ok: false, error: 'Duplicate pending' });
  });

  it('should return 429 for rate limit exceeded', async () => {
    mockDb.getRecentSignaturesByEmail.mockResolvedValue(5); // Exceeds limit of 3

    const response = await request(app)
      .post('/api/petitions/test-petition/sign')
      .send({
        email: 'test@example.com',
        full_name: 'Test User',
        country: 'US',
        consent_news: true,
        turnstileToken: 'test-turnstile-token',
      });

    expect(response.status).toBe(429);
    expect(response.body).toEqual({ ok: false, error: 'Rate limited' });
  });
});

describe('GET /api/petitions/:slug/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return petition stats', async () => {
    mockDb.getPetitionStats.mockResolvedValue({
      id: 'petition-1',
      slug: 'test-petition',
      title: 'Test Petition',
      confirmed_count: 1234,
    });

    const response = await request(app)
      .get('/api/petitions/test-petition/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      data: {
        confirmed_count: 1234,
      },
    });
  });

  it('should return 404 for non-existent petition', async () => {
    mockDb.getPetitionStats.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/petitions/non-existent/stats');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ ok: false, error: 'Petition not found' });
  });
});
