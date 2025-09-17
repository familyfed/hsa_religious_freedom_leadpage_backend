# 🚀 **Production Setup Guide**

**Date:** January 2025  
**Project:** HSA Religious Freedom Leadpage Backend API  
**Version:** 1.0.0

---

## 📋 **Overview**

This document outlines the complete production setup for the HSA Religious Freedom Leadpage Backend API, including custom domain configuration, deployment processes, and operational procedures.

---

## 🌐 **Custom Domain Configuration**

### **Production Environment**
- **Custom Domain:** `https://api.petition.motherofpeace.com`
- **GitHub Branch:** `main`
- **Vercel Deployment:** Production
- **Status:** ✅ Live and operational

### **Staging Environment**
- **Custom Domain:** `https://staging.api.petition.motherofpeace.com`
- **GitHub Branch:** `develop`
- **Vercel Deployment:** Preview
- **Status:** ✅ Live and operational

---

## 🔧 **Backend API Endpoints**

### **Base URLs**
```
Production:  https://api.petition.motherofpeace.com
Staging:     https://staging.api.petition.motherofpeace.com
```

### **Core Endpoints**

#### **Health Check**
```http
GET /health
```
**Response:**
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2025-01-XX T XX:XX:XX.XXXZ",
  "version": "1.0.0"
}
```

#### **Petition Statistics**
```http
GET /api/petitions/campaign/stats
```
**Response:**
```json
{
  "totalSignatures": 1234,
  "campaigns": [...],
  "lastUpdated": "2025-01-XX T XX:XX:XX.XXXZ"
}
```

#### **Petition Signing**
```http
POST /api/petitions/sign
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "campaignId": "religious-freedom-2025",
  "turnstileToken": "cf-turnstile-token"
}
```

#### **Admin Endpoints**
```http
GET /api/admin/petitions
Authorization: Bearer <admin-jwt-token>
```

---

## 🔒 **CORS Configuration**

### **Allowed Origins**
The API accepts requests from the following origins:

```javascript
corsOrigins: [
  'http://localhost:3000',                                    // Development
  'https://petition.motherofpeace.com',                       // Production frontend
  'https://staging.petition.motherofpeace.com',              // Staging frontend
  'https://hsa-petitions.vercel.app',                        // Stable frontend domain
  'https://hsa-petitions-api.vercel.app',                    // Stable backend domain
  'https://religiousfreedom.vercel.app',                     // Original domain
  'https://hsa-religious-freedom-leadpage-frontend.vercel.app', // Production domain
  /^https:\/\/hsa-religious-freedom-leadpage-frontend-.*\.vercel\.app$/, // Dynamic Vercel URLs
  /^https:\/\/hsa-religious-freedom-leadpage-fron-.*\.vercel\.app$/, // Shortened Vercel URLs
  /^https:\/\/.*\.vercel\.app$/,                             // All Vercel domains as fallback
]
```

### **CORS Headers**
```http
Access-Control-Allow-Origin: <requesting-origin>
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
Access-Control-Allow-Credentials: true
```

---

## 🛡️ **Security Configuration**

### **Rate Limiting**
- **Window:** 1 hour (3,600,000 ms)
- **Max Requests:** 3 per window per IP
- **Special Endpoints:** Petition signing has additional rate limiting

### **Authentication**
- **JWT Secret:** Environment variable `JWT_SECRET`
- **Admin API Key:** Environment variable `ADMIN_API_KEY`
- **Turnstile Integration:** Cloudflare Turnstile for bot protection

### **Security Headers**
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🗄️ **Database Configuration**

### **Supabase Integration**
- **URL:** `NEXT_PUBLIC_SUPABASE_URL`
- **Service Role Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Anon Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Database Schema**
- **Petitions Table:** Stores petition signatures and campaign data
- **Campaigns Table:** Manages petition campaigns
- **Admin Table:** Handles admin user authentication

---

## 📧 **Email Configuration**

### **Resend Integration**
- **API Key:** `RESEND_API_KEY`
- **From Address:** `Petitions <no-reply@example.com>`
- **Confirmation Emails:** Sent after successful petition signing

---

## 🚀 **Deployment Process**

### **Production Deployment**
1. **Merge to Main:** Changes must be merged to `main` branch
2. **Auto-Deploy:** Vercel automatically deploys from `main` branch
3. **Custom Domain:** `api.petition.motherofpeace.com` is automatically updated
4. **Health Check:** Verify deployment at `https://api.petition.motherofpeace.com/health`

### **Staging Deployment**
1. **Push to Develop:** Changes pushed to `develop` branch
2. **Auto-Deploy:** Vercel automatically deploys from `develop` branch
3. **Custom Domain:** `staging.api.petition.motherofpeace.com` is automatically updated
4. **Health Check:** Verify deployment at `https://staging.api.petition.motherofpeace.com/health`

---

## 🧪 **Testing Procedures**

### **Health Check Test**
```bash
curl -X GET https://api.petition.motherofpeace.com/health
curl -X GET https://staging.api.petition.motherofpeace.com/health
```

### **CORS Test**
```bash
curl -X OPTIONS https://api.petition.motherofpeace.com/api/petitions/campaign/stats \
  -H "Origin: https://petition.motherofpeace.com" \
  -H "Access-Control-Request-Method: GET"
```

### **Petition Signing Test**
```bash
curl -X POST https://staging.api.petition.motherofpeace.com/api/petitions/sign \
  -H "Content-Type: application/json" \
  -H "Origin: https://staging.petition.motherofpeace.com" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "campaignId": "test-campaign",
    "turnstileToken": "test-token"
  }'
```

---

## 📊 **Monitoring & Analytics**

### **Health Monitoring**
- **Endpoint:** `/health`
- **Response Time:** < 200ms expected
- **Uptime:** 99.9% target

### **Error Logging**
- **Logger:** Winston-based logging system
- **Log Levels:** error, warn, info, debug
- **CORS Violations:** Logged with origin details

### **Analytics Integration**
- **Plausible Domain:** `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- **Event Tracking:** Petition signing events

---

## 🔄 **Environment Variables**

### **Required Variables**
```bash
# App Configuration
NODE_ENV=production
PORT=3021
APP_ORIGIN=https://petition.motherofpeace.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Petitions <no-reply@example.com>

# Security
JWT_SECRET=your_jwt_secret
ADMIN_API_KEY=your_admin_api_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your_plausible_domain
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **CORS Errors**
- **Symptom:** `Not allowed by CORS` error
- **Solution:** Verify requesting origin is in `corsOrigins` array
- **Check:** Origin header matches exactly (including protocol)

#### **Rate Limiting**
- **Symptom:** `Too Many Requests` error
- **Solution:** Wait for rate limit window to reset (1 hour)
- **Check:** IP address rate limiting logs

#### **Database Connection**
- **Symptom:** Database query failures
- **Solution:** Verify Supabase credentials and connection
- **Check:** Environment variables are correctly set

#### **SSL Certificate Issues**
- **Symptom:** HTTPS connection failures
- **Solution:** Verify custom domain SSL certificate in Vercel
- **Check:** Domain DNS configuration

---

## 📞 **Support & Maintenance**

### **Emergency Contacts**
- **Backend Team:** [Contact Information]
- **DevOps Team:** [Contact Information]
- **Vercel Support:** [Vercel Support Portal]

### **Maintenance Windows**
- **Scheduled:** [Schedule if applicable]
- **Emergency:** As needed for critical issues
- **Notifications:** [Notification method]

---

## 📚 **Additional Resources**

- **API Documentation:** [Link to detailed API docs]
- **Frontend Integration Guide:** `docs/FRONTEND_INTEGRATION_GUIDE.md`
- **CORS Configuration:** `docs/CORS_FIX_RESPONSE.md`
- **Deployment Guide:** `docs/VERCEL_DEPLOYMENT.md`

---

**Last Updated:** January 2025  
**Document Version:** 1.0.0  
**Maintained By:** Backend Development Team
