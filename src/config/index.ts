import dotenv from 'dotenv';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

export const config = {
  // App
  port: parseInt(process.env.PORT || '3021', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:3000',
  
  // CORS origins - support multiple frontend domains including stable Vercel subdomains
  corsOrigins: [
    process.env.APP_ORIGIN || 'http://localhost:3000',
    'https://hsa-petitions.vercel.app', // NEW: Stable frontend domain
    'https://hsa-petitions-api.vercel.app', // NEW: Stable backend domain
    'https://religiousfreedom.vercel.app', // Original domain
    'https://hsa-religious-freedom-leadpage-frontend.vercel.app', // Production domain
    'https://hsa-religious-freedom-leadpage-fron-sandy.vercel.app', // Current frontend
    /^https:\/\/hsa-religious-freedom-leadpage-frontend-.*\.vercel\.app$/, // Dynamic Vercel URLs
    /^https:\/\/hsa-religious-freedom-leadpage-fron-.*\.vercel\.app$/, // Shortened Vercel URLs
    /^https:\/\/.*\.vercel\.app$/, // All Vercel domains as fallback
  ],

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  // Email
  email: {
    resendApiKey: process.env.RESEND_API_KEY!,
    from: process.env.EMAIL_FROM || 'Petitions <no-reply@example.com>',
  },

  // Security
  security: {
    turnstile: {
      siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    },
    jwtSecret: process.env.JWT_SECRET!,
    adminApiKey: process.env.ADMIN_API_KEY!,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10),
  },

  // Analytics
  analytics: {
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'RESEND_API_KEY',
  'TURNSTILE_SECRET_KEY',
  'JWT_SECRET',
  'ADMIN_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
