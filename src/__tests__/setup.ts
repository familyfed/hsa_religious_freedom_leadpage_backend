// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock external services for testing
jest.mock('../services/email');
jest.mock('../database/supabase');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_API_KEY = 'test-admin-key';
process.env.APP_ORIGIN = 'http://localhost:3000';
