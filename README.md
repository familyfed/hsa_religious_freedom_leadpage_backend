# HSA Religious Freedom Petition Landing Page - Backend API

A robust Node.js/Express backend API for the HSA Religious Freedom Petition Landing Page, built with Supabase, Resend email service, and comprehensive security features.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- Resend account
- Cloudflare Turnstile account

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Set up Supabase database:**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - Get your project URL and API keys

4. **Configure services:**
   - Set up Resend account and get API key
   - Set up Cloudflare Turnstile and get site/secret keys
   - Update all environment variables in `.env`

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
APP_ORIGIN=https://yourdomain.com
PORT=3001
NODE_ENV=development

# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM="Petitions <no-reply@yourdomain.com>"

# Bot Protection
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=3

# Security
JWT_SECRET=your_jwt_secret_here
ADMIN_API_KEY=your_admin_api_key_here
```

## 🔌 API Endpoints

### Public Endpoints

#### POST `/api/petitions/:slug/sign`
Sign a petition.

**Request:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "country": "US",
  "consent_news": true,
  "turnstileToken": "cf-turnstile-token"
}
```

**Responses:**
- `200` - Success
- `400` - Validation error or bot check failed
- `404` - Petition not found
- `409` - Duplicate pending signature
- `429` - Rate limited
- `500` - Server error

#### GET `/api/petitions/:slug/stats`
Get petition statistics.

**Response:**
```json
{
  "ok": true,
  "data": {
    "confirmed_count": 12487
  }
}
```

#### GET `/api/confirm?token=...`
Confirm email signature (redirects to frontend).

### Admin Endpoints

#### GET `/api/admin/signatures.csv?petition=slug`
Export signatures as CSV (requires JWT token with admin role or `X-API-Key` header).

**Authentication:**
- JWT Token: `Authorization: Bearer <jwt-token>` (requires admin role)
- API Key: `X-API-Key: <admin-api-key>` (fallback)

#### GET `/api/admin/stats?petition=slug`
Get detailed petition statistics (requires JWT token with admin role or `X-API-Key` header).

**Authentication:**
- JWT Token: `Authorization: Bearer <jwt-token>` (requires admin role)
- API Key: `X-API-Key: <admin-api-key>` (fallback)

## 🛡️ Security Features

- **JWT Authentication**: Supabase JWT token verification using JWKS for admin endpoints
- **Cloudflare Turnstile**: Bot protection on signup
- **Rate Limiting**: Per-email and per-IP limits
- **Input Validation**: Comprehensive request validation
- **Disposable Email Detection**: Blocks temporary email services
- **Data Hashing**: IP addresses and User Agents are hashed
- **CORS Protection**: Configured for specific origins
- **Helmet Security**: Security headers
- **Role-Based Access**: Admin endpoints require admin role in JWT

## 📧 Email Service

Uses Resend for transactional emails:

- **Confirmation Email**: Sent after petition signing
- **Thank You Email**: Sent after email confirmation
- **Email Logging**: All attempts logged to database
- **Error Handling**: Graceful failure with logging

## 🗄️ Database Schema

### Tables

- **petitions**: Petition information
- **signatures**: User signatures with confirmation flow
- **email_log**: Email delivery tracking
- **petition_stats**: Materialized view for statistics

### Row Level Security (RLS)

- Public can read public petitions
- Anyone can create signatures
- Only petition owners can view signatures
- Service role manages email logs

## 📊 Monitoring & Logging

- **Winston Logger**: Structured JSON logging
- **Request Logging**: All API requests logged
- **Error Tracking**: Comprehensive error logging
- **Email Tracking**: Delivery success/failure logging

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up monitoring and alerting
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 Performance

- **Connection Pooling**: Supabase client optimized
- **Indexed Queries**: Database indexes for fast lookups
- **Rate Limiting**: Prevents abuse
- **Caching**: Consider Redis for high-traffic scenarios

## 🔧 Development

### Project Structure

```
src/
├── config/          # Configuration management
├── database/        # Database service layer
├── routes/          # API route handlers
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Adding New Features

1. Define types in `src/types/`
2. Add database methods in `src/database/supabase.ts`
3. Create service logic in `src/services/`
4. Add routes in `src/routes/`
5. Update validation in `src/utils/validation.ts`

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Check Supabase URL and keys
2. **Email Delivery**: Verify Resend API key and domain
3. **Turnstile Errors**: Check site/secret key configuration
4. **Rate Limiting**: Adjust limits in environment variables

### Logs

Check application logs for detailed error information:

```bash
# Development
npm run dev

# Production
tail -f logs/combined.log
tail -f logs/error.log
```

## 📞 Support

For issues or questions:
- Check the logs for error details
- Verify environment variable configuration
- Test API endpoints with curl/Postman
- Review Supabase dashboard for database issues

## 📄 License

MIT License - see LICENSE file for details.
