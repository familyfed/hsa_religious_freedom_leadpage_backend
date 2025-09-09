# 🚀 Backend API Ready for Integration

**Date:** September 9, 2025  
**To:** Frontend Development Team  
**From:** Backend Development Team  
**Subject:** Petition Signing API - Production Ready

---

## 🎉 **Great News!**

The backend API is now **fully deployed and production-ready** for the Religious Freedom petition campaign. All endpoints are tested, secured, and ready for frontend integration.

## 📍 **API Endpoints**

### **Base URL**
```
https://hsa-religious-freedom-leadpage-backend-ieytdg9ro.vercel.app
```

### **Available Endpoints**

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `GET` | `/health` | Health check | ✅ Ready |
| `GET` | `/api/petitions/[slug]/stats` | Get petition statistics | ✅ Ready |
| `POST` | `/api/petitions/[slug]/sign` | Sign petition | ✅ Ready |

---

## 🔧 **Integration Details**

### **1. Health Check**
```javascript
// Test API connectivity
const response = await fetch('https://hsa-religious-freedom-leadpage-backend-ieytdg9ro.vercel.app/health');
const data = await response.json();
// Returns: { "ok": true, "status": "healthy", "timestamp": "...", "version": "1.0.0" }
```

### **2. Get Petition Statistics**
```javascript
// Get current signature count
const response = await fetch('https://hsa-religious-freedom-leadpage-backend-ieytdg9ro.vercel.app/api/petitions/campaign/stats');
const data = await response.json();
// Returns: { "ok": true, "data": { "confirmed_count": 0 } }
```

### **3. Sign Petition (Main Endpoint)**
```javascript
// Sign the petition
const response = await fetch('https://hsa-religious-freedom-leadpage-backend-ieytdg9ro.vercel.app/api/petitions/campaign/sign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    country: 'US',
    city: 'New York',
    state: 'NY', // Optional
    consent_news: true, // Optional
    turnstileToken: 'your_turnstile_token_here'
  })
});

const data = await response.json();
```

---

## 📋 **Request/Response Schemas**

### **Sign Petition Request**
```typescript
interface SignPetitionRequest {
  first_name: string;        // Required, 2-50 characters
  last_name: string;         // Required, 2-50 characters
  email: string;             // Required, valid email format
  country: string;           // Required, 2-letter country code (US, CA, GB, etc.)
  city: string;              // Required, 2-100 characters
  state?: string;            // Optional, 2-50 characters
  consent_news?: boolean;    // Optional, defaults to false
  turnstileToken: string;    // Required, Cloudflare Turnstile token
}
```

### **Success Response**
```typescript
interface SignPetitionSuccess {
  ok: true;
  data: {
    signature_id: string;
    confirm_token: string;
    message: string;
  };
}
```

### **Error Response**
```typescript
interface SignPetitionError {
  ok: false;
  error: string;
  details?: Array<{
    type: string;
    value: any;
    msg: string;
    path: string;
    location: string;
  }>;
}
```

---

## 🔒 **Security Features**

### **1. Cloudflare Turnstile Integration**
- **Required:** All petition signing requests must include a valid Turnstile token
- **Implementation:** Use Cloudflare Turnstile widget on your form
- **Site Key:** You'll need to get this from Cloudflare dashboard

### **2. Rate Limiting**
- **Limit:** 10 requests per minute per IP
- **Response:** `429 Too Many Requests` when exceeded
- **Handling:** Show user-friendly message and retry after delay

### **3. Input Validation**
- **Email:** Must be valid email format
- **Country:** Must be valid 2-letter country code
- **Names:** 2-50 characters, sanitized
- **City:** 2-100 characters, sanitized
- **State:** Optional, 2-50 characters if provided

---

## 📧 **Email Confirmation Flow**

### **Process:**
1. User submits petition form
2. API creates signature with `status: 'pending'`
3. API sends confirmation email to user
4. User clicks confirmation link
5. Signature status changes to `confirmed'`
6. User receives thank you email

### **Email Details:**
- **From:** `"Petitions <hello@peacestartswithme.nyc>"`
- **Confirmation:** Contains unique token for verification
- **Thank You:** Sent after successful confirmation

---

## 🌍 **CORS Configuration**

The API is configured to accept requests from:
- **Primary:** `https://religiousfreedom.vercel.app`
- **Current Frontend:** `https://hsa-religious-freedom-leadpage-frontend-2kplfats3.vercel.app`
- **Development:** `http://localhost:3000` (if needed)

---

## 🧪 **Testing**

### **Test Endpoints:**
```bash
# Health check
curl https://hsa-religious-freedom-leadpage-backend-ieytdg9ro.vercel.app/health

# Get stats
curl https://hsa-religious-freedom-leadpage-backend-ieytdg9ro.vercel.app/api/petitions/campaign/stats
```

### **Test Petition Signing:**
```bash
curl -X POST https://hsa-religious-freedom-leadpage-backend-ieytdg9ro.vercel.app/api/petitions/campaign/sign \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "country": "US",
    "city": "Test City",
    "turnstileToken": "test_token"
  }'
```

---

## 🚨 **Error Handling**

### **Common Error Scenarios:**

| Error | Status | Description | Action |
|-------|--------|-------------|--------|
| `Bot check failed` | 400 | Invalid Turnstile token | Re-verify Turnstile |
| `Rate limited` | 429 | Too many requests | Show retry message |
| `Invalid input` | 400 | Validation errors | Show field-specific errors |
| `Email already exists` | 409 | Duplicate email | Show "already signed" message |

### **Error Response Example:**
```json
{
  "ok": false,
  "error": "Invalid input",
  "details": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Valid email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

## 📱 **Frontend Implementation Tips**

### **1. Form Validation**
- Validate all fields client-side before submission
- Show real-time validation feedback
- Handle server-side validation errors gracefully

### **2. Turnstile Integration**
```javascript
// Initialize Turnstile
window.turnstile.render('#turnstile-widget', {
  sitekey: 'YOUR_TURNSTILE_SITE_KEY',
  callback: function(token) {
    // Token is ready for form submission
  }
});
```

### **3. Loading States**
- Show loading spinner during API calls
- Disable form during submission
- Handle network errors with retry options

### **4. Success/Error Messages**
- Clear success confirmation
- User-friendly error messages
- Instructions for email confirmation

---

## 🔗 **Required Dependencies**

### **Cloudflare Turnstile**
- **CDN:** `https://challenges.cloudflare.com/turnstile/v0/api.js`
- **Documentation:** https://developers.cloudflare.com/turnstile/

### **Country Code Validation**
- **Valid Codes:** US, CA, GB, AU, DE, FR, JP, KR, etc.
- **Format:** 2-letter uppercase codes

---

## 📞 **Support & Contact**

### **Backend Team Contact:**
- **Email:** media@unification.org
- **Response Time:** Within 24 hours

### **API Monitoring:**
- **Health Check:** Available at `/health`
- **Uptime:** 99.9% expected
- **Monitoring:** 24/7 automated monitoring

---

## 🎯 **Next Steps**

1. **✅ Get Turnstile Site Key** from Cloudflare dashboard
2. **✅ Implement form validation** with the provided schemas
3. **✅ Add Turnstile widget** to petition form
4. **✅ Test integration** with the provided endpoints
5. **✅ Handle email confirmation** flow in UI
6. **✅ Deploy to production** when ready

---

## 🚀 **Ready to Go!**

The backend is **100% ready** for integration. All endpoints are tested, secured, and documented. The API will handle all petition signing, email confirmations, and data validation.

**Happy coding!** 🎉

---

*This letter was generated on September 9, 2025, for the Religious Freedom petition campaign backend integration.*
