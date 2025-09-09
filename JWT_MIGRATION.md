# 🔄 JWT Migration Guide - Legacy to New Supabase JWT Signing Keys

This guide helps you migrate from Supabase's legacy JWT secret to the new asymmetric JWT signing keys system.

## 🚨 Important Changes

Supabase has migrated from symmetric JWT secrets to asymmetric JWT signing keys. This affects how JWT tokens are verified in your backend.

## ✅ What's Changed

### Before (Legacy System)
- Used symmetric JWT secret for verification
- Required `SUPABASE_JWT_SECRET` environment variable
- Manual key management
- Single point of failure

### After (New System)
- Uses asymmetric JWT signing keys (JWKS)
- No JWT secret environment variable needed
- Automatic key rotation support
- Better performance and security

## 🔧 Migration Steps

### 1. Update Supabase Project

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API** → **JWT Settings**
3. Click **"Migrate JWT secret"** button
4. This imports your existing JWT secret into the new system
5. New asymmetric key pairs are generated automatically

### 2. Update Backend Code

The backend has been updated to use JWKS verification. No code changes needed if you're using the latest version.

### 3. Update Environment Variables

**Remove this variable:**
```env
# Remove this line - no longer needed
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
```

**Keep these variables:**
```env
# Keep these - still needed
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your_app_jwt_secret_here  # Optional
ADMIN_API_KEY=your_admin_api_key_here
```

### 4. Test the Migration

1. **Test JWKS Endpoint:**
   ```bash
   curl https://your-project.supabase.co/auth/v1/.well-known/jwks.json
   ```
   Should return JSON with public keys.

2. **Test JWT Verification:**
   ```bash
   # Test admin endpoint with JWT token
   curl -H "Authorization: Bearer your-jwt-token" \
        "http://localhost:3001/api/admin/stats?petition=campaign"
   ```

3. **Check Logs:**
   ```bash
   docker-compose logs api | grep JWT
   ```

## 🔍 How It Works Now

### JWT Verification Process

1. **Token Received**: Backend receives JWT token in Authorization header
2. **Extract Key ID**: Decodes JWT header to get `kid` (key ID)
3. **Fetch Public Key**: Retrieves public key from JWKS endpoint
4. **Verify Token**: Validates signature using public key
5. **Check Claims**: Verifies issuer, audience, expiration, etc.

### JWKS Endpoint

The public keys are automatically available at:
```
https://your-project.supabase.co/auth/v1/.well-known/jwks.json
```

### Caching

- Public keys are cached for 10 minutes
- Automatic refresh when keys rotate
- Rate limiting prevents excessive requests

## 🛡️ Security Benefits

### Improved Security
- ✅ Asymmetric cryptography (RSA/ECDSA)
- ✅ Automatic key rotation
- ✅ No shared secrets
- ✅ Better key management

### Performance Benefits
- ✅ Local verification (no Auth server calls)
- ✅ Cached public keys
- ✅ Reduced latency
- ✅ Better scalability

## 🔧 Troubleshooting

### Common Issues

**"Unable to find a signing key that matches"**
- Check if JWKS endpoint is accessible
- Verify token has valid `kid` in header
- Ensure Supabase project is migrated

**"JWT verification failed"**
- Check token format and structure
- Verify issuer matches your Supabase URL
- Check token expiration

**"JWKS endpoint not accessible"**
- Verify Supabase project URL is correct
- Check network connectivity
- Ensure project is not paused

### Debug Commands

```bash
# Test JWKS endpoint
curl -I https://your-project.supabase.co/auth/v1/.well-known/jwks.json

# Decode JWT token header
echo "your-jwt-token" | base64 -d | jq

# Check backend logs
docker-compose logs api | grep -i jwks
```

## 📊 Monitoring

### Key Metrics to Monitor

1. **JWKS Fetch Success Rate**
2. **JWT Verification Success Rate**
3. **Key Rotation Events**
4. **Authentication Failures**

### Log Messages

Look for these log messages:
- `"JWT verification successful"` - Token verified
- `"Failed to get signing key"` - JWKS fetch failed
- `"JWT verification failed"` - Token invalid
- `"Key rotation detected"` - New keys available

## ✅ Verification Checklist

After migration, verify:

- [ ] JWKS endpoint is accessible
- [ ] JWT tokens are verified successfully
- [ ] Admin endpoints work with JWT authentication
- [ ] Key rotation is working
- [ ] No JWT secret environment variable needed
- [ ] Logs show successful JWT verification
- [ ] Fallback API key authentication still works
- [ ] Frontend can obtain and use JWT tokens

## 🎉 Migration Complete!

Your backend now uses Supabase's new JWT signing keys system with:
- ✅ Better security with asymmetric keys
- ✅ Automatic key rotation support
- ✅ Improved performance
- ✅ No manual key management
- ✅ Future-proof authentication

## 📚 Additional Resources

- [Supabase JWT Documentation](https://supabase.com/docs/guides/auth/jwt)
- [JWKS Specification](https://tools.ietf.org/html/rfc7517)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
