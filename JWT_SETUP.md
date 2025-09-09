# 🔐 JWT Authentication Setup Guide

This guide explains how to configure JWT authentication with Supabase's new JWT Signing Keys for the HSA Religious Freedom Petition Backend.

## 📋 Overview

The backend supports JWT authentication using Supabase's new asymmetric JWT signing keys for admin endpoints. This provides secure, role-based access control with improved performance and security.

## 🔧 Supabase JWT Configuration

### 1. Migrate to New JWT Signing Keys

Supabase has migrated from legacy JWT secrets to asymmetric JWT signing keys. Follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API** → **JWT Settings**
3. Click **"Migrate JWT secret"** to import your existing JWT secret
4. This will generate new asymmetric key pairs without downtime

### 2. Configure JWT Settings

In your Supabase project:

1. Go to **Settings** → **API** → **JWT Settings**
2. Set the **JWT expiry limit** (recommended: 3600 seconds = 1 hour)
3. Configure **JWT claims** if needed
4. The public key is automatically available at `https://your-project.supabase.co/auth/v1/.well-known/jwks.json`

### 3. Set Up User Roles

To use admin endpoints, users need the `admin` or `service_role` role in their JWT token.

#### Option A: Using Supabase Auth (Recommended)
```sql
-- Update user metadata to include admin role
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@yourdomain.com';
```

#### Option B: Using Custom Claims
You can also set custom claims in your JWT tokens when creating them.

## 🔑 Environment Variables

The new JWT system doesn't require a JWT secret in your environment variables. The backend automatically fetches the public keys from Supabase's JWKS endpoint.

Add these to your `.env` file:

```env
# JWT Configuration (no JWT secret needed with new system)
JWT_SECRET=your_app_jwt_secret_here  # For app-specific JWT operations (optional)
```

## 🚀 Using JWT Authentication

### Frontend Integration

When making requests to admin endpoints, include the JWT token:

```javascript
// Get JWT token from Supabase auth
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Make authenticated request
const response = await fetch('/api/admin/signatures.csv?petition=campaign', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Testing with curl

```bash
# Get JWT token from Supabase (you'll need to implement this in your frontend)
JWT_TOKEN="your-jwt-token-here"

# Test admin endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "http://localhost:3001/api/admin/stats?petition=campaign"
```

## 🔒 JWT Token Structure

The backend expects JWT tokens with this structure:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "admin",
  "aud": "authenticated",
  "iss": "https://your-project.supabase.co/auth/v1",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### Required Fields:
- `sub`: User ID
- `exp`: Expiration timestamp
- `role`: User role (must be "admin" or "service_role" for admin endpoints)
- `iss`: Issuer (your Supabase project URL)
- `aud`: Audience (usually "authenticated")

## 🛡️ Security Features

### Token Verification
- ✅ Validates JWT signature using Supabase public keys (JWKS)
- ✅ Checks token expiration
- ✅ Verifies required claims (issuer, audience)
- ✅ Role-based access control
- ✅ Automatic key rotation support
- ✅ Cached key fetching for performance

### Admin Access
- ✅ Requires `admin` or `service_role` role
- ✅ Logs all admin access attempts
- ✅ Fallback to API key authentication

### Error Handling
- ✅ Invalid tokens return 401 Unauthorized
- ✅ Expired tokens return 401 Unauthorized
- ✅ Missing roles return 403 Forbidden
- ✅ Detailed error logging

## 🔄 Fallback Authentication

The backend supports both JWT and API key authentication:

1. **JWT Token** (preferred): `Authorization: Bearer <token>`
2. **API Key** (fallback): `X-API-Key: <admin-key>`

This ensures compatibility with different client implementations.

## 🧪 Testing JWT Authentication

### 1. Test Valid Token
```bash
# Create a test JWT token (you'll need to implement this)
curl -H "Authorization: Bearer valid-jwt-token" \
     "http://localhost:3001/api/admin/stats?petition=campaign"
```

### 2. Test Invalid Token
```bash
curl -H "Authorization: Bearer invalid-token" \
     "http://localhost:3001/api/admin/stats?petition=campaign"
# Expected: 401 Unauthorized
```

### 3. Test Missing Role
```bash
# Token without admin role
curl -H "Authorization: Bearer user-token" \
     "http://localhost:3001/api/admin/stats?petition=campaign"
# Expected: 403 Forbidden
```

## 🔧 Troubleshooting

### Common Issues

**"Invalid or missing authentication token"**
- Check if JWT token is properly formatted
- Verify token is included in Authorization header
- Ensure token starts with "Bearer "

**"Token has expired"**
- Check token expiration time
- Refresh token if needed
- Verify system clock is correct

**"Admin access required"**
- Check if user has admin role in JWT token
- Verify role is set correctly in Supabase
- Check JWT token claims

**"JWT verification failed"**
- Check if JWKS endpoint is accessible: `https://your-project.supabase.co/auth/v1/.well-known/jwks.json`
- Verify token was signed with current Supabase keys
- Check if token has valid `kid` (key ID) in header
- Ensure token issuer matches your Supabase project URL

### Debug Steps

1. **Check JWKS Endpoint:**
   ```bash
   curl https://your-project.supabase.co/auth/v1/.well-known/jwks.json
   ```

2. **Verify Token Structure:**
   Use jwt.io to decode and inspect your JWT token

3. **Check Logs:**
   ```bash
   docker-compose logs api | grep JWT
   ```

4. **Test JWKS Connectivity:**
   ```bash
   # Test if JWKS endpoint is accessible
   curl -I https://your-project.supabase.co/auth/v1/.well-known/jwks.json
   ```

## 📚 Additional Resources

- [Supabase JWT Documentation](https://supabase.com/docs/guides/auth/jwt)
- [JWT.io Debugger](https://jwt.io/)
- [JSON Web Token RFC](https://tools.ietf.org/html/rfc7519)

## ✅ Verification Checklist

Before going live, ensure:

- [ ] Supabase JWT signing keys are migrated
- [ ] JWKS endpoint is accessible: `https://your-project.supabase.co/auth/v1/.well-known/jwks.json`
- [ ] Admin users have proper roles in JWT tokens
- [ ] JWT tokens are properly formatted with correct issuer
- [ ] Token expiration is configured appropriately
- [ ] Admin endpoints require authentication
- [ ] Error responses are properly formatted
- [ ] Logging is working for auth attempts
- [ ] Fallback API key authentication works
- [ ] CORS is configured for JWT headers
- [ ] Frontend can obtain and use JWT tokens
- [ ] Key rotation is working properly

## 🎉 You're Ready!

Your JWT authentication is now configured and ready to secure your admin endpoints!
