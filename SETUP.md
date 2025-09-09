# 🚀 Quick Setup Guide

This guide will help you get the HSA Religious Freedom Petition Backend API running quickly.

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Supabase account and project
- [ ] Resend account for email service
- [ ] Cloudflare Turnstile account for bot protection
- [ ] Domain configured (for production)

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp env.example .env
# Edit .env with your actual values
```

### 3. Configure Supabase Database
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL to create tables and policies
5. Note your project URL and API keys

### 4. Configure Services

#### Resend (Email Service)
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Get your API key
4. Update `RESEND_API_KEY` in `.env`

#### Cloudflare Turnstile (Bot Protection)
1. Sign up at [cloudflare.com/products/turnstile](https://cloudflare.com/products/turnstile)
2. Create a new site
3. Get your site key and secret key
4. Update `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in `.env`

#### JWT Authentication (Admin Access)
1. In your Supabase project, go to **Settings** → **API** → **JWT Settings**
2. Click **"Migrate JWT secret"** to enable new JWT signing keys
3. No additional environment variables needed (uses JWKS automatically)
4. Set up admin users with proper roles (see `JWT_SETUP.md` for details)

### 5. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Sign a Petition
```bash
curl -X POST http://localhost:3001/api/petitions/campaign/sign \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "country": "US",
    "consent_news": true,
    "turnstileToken": "your-turnstile-token"
  }'
```

### Get Stats
```bash
curl http://localhost:3001/api/petitions/campaign/stats
```

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `RESEND_API_KEY` | Resend API key | `re_1234567890abcdef` |
| `EMAIL_FROM` | Email sender address | `Petitions <no-reply@yourdomain.com>` |
| `TURNSTILE_SITE_KEY` | Turnstile site key | `0x4AAAAAAA...` |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key | `0x4AAAAAAA...` |
| `APP_ORIGIN` | Frontend URL | `https://yourdomain.com` |
| `ADMIN_API_KEY` | Admin API key | `admin-secret-key-123` |

## 🚀 Production Deployment

### Using Docker (Recommended)
```bash
# Build and start
npm run build
docker-compose up -d

# Or use the deployment script
./scripts/deploy.sh production
```

### Manual Deployment
```bash
# Build
npm run build

# Start
npm start
```

## 🔍 Troubleshooting

### Common Issues

**Database Connection Error**
- Check Supabase URL and keys
- Ensure RLS policies are set up correctly
- Verify database schema is deployed

**Email Not Sending**
- Check Resend API key
- Verify domain is verified in Resend
- Check email logs in database

**Turnstile Verification Failing**
- Verify site and secret keys
- Check domain configuration in Turnstile
- Ensure frontend is sending correct token

**Rate Limiting Issues**
- Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Check IP-based rate limiting in nginx

### Logs
```bash
# View application logs
docker-compose logs api

# View real-time logs
docker-compose logs -f api
```

## 📊 Monitoring

### Health Endpoints
- `GET /health` - Application health check
- `GET /api/petitions/:slug/stats` - Petition statistics

### Admin Endpoints
- `GET /api/admin/signatures.csv?petition=slug` - Export signatures
- `GET /api/admin/stats?petition=slug` - Detailed statistics

## 🆘 Support

If you encounter issues:

1. Check the logs for error details
2. Verify all environment variables are set
3. Test individual services (Supabase, Resend, Turnstile)
4. Review the API documentation in `README.md`

## ✅ Verification Checklist

Before going live, ensure:

- [ ] All environment variables are configured
- [ ] Database schema is deployed
- [ ] Email service is working (test with real email)
- [ ] Turnstile protection is active
- [ ] Rate limiting is configured
- [ ] Admin API key is set
- [ ] Frontend can connect to API
- [ ] Health check endpoint responds
- [ ] Logs are being generated
- [ ] SSL certificate is configured (production)

## 🎉 You're Ready!

Your backend API is now ready to handle petition signatures with:
- ✅ Bot protection
- ✅ Rate limiting  
- ✅ Email confirmation
- ✅ Data export
- ✅ Security features
- ✅ Monitoring

The frontend can now connect to your API endpoints!
