# 🚀 **Backend API Ready - Custom Domains Live!**

**Date:** January 17, 2025  
**To:** Frontend Development Team  
**From:** Backend Development Team  
**Subject:** Custom Domain Backend APIs Ready for Integration

---

## 🎉 **GREAT NEWS!**

Your backend APIs are now **LIVE and OPERATIONAL** with custom domains! Both staging and production environments are fully configured and tested. You can now integrate with the new custom domain endpoints.

---

## 🌐 **Custom Domain Configuration**

### **✅ Staging Environment**
- **Backend API:** `https://staging.api.petition.motherofpeace.com`
- **Frontend Domain:** `https://staging.petition.motherofpeace.com`
- **GitHub Branch:** `develop`
- **Status:** ✅ **LIVE and TESTED**

### **✅ Production Environment**
- **Backend API:** `https://api.petition.motherofpeace.com`
- **Frontend Domain:** `https://petition.motherofpeace.com`
- **GitHub Branch:** `main`
- **Status:** ✅ **LIVE and TESTED**

---

## 🔧 **API Endpoints Ready**

### **Base URLs for Integration**
```javascript
// Environment-specific configuration
const API_ENDPOINTS = {
  staging: 'https://staging.api.petition.motherofpeace.com',
  production: 'https://api.petition.motherofpeace.com'
};

// Use based on your environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? API_ENDPOINTS.production 
  : API_ENDPOINTS.staging;
```

### **Available Endpoints**

#### **1. Health Check**
```javascript
GET /health
// Response: { "ok": true, "status": "healthy", "timestamp": "...", "version": "1.0.0" }
```

#### **2. Petition Statistics**
```javascript
GET /api/petitions/campaign/stats
// Response: { "ok": true, "data": { "confirmed_count": 1234 } }
```

#### **3. Sign Petition** (Main Endpoint)
```javascript
POST /api/petitions/campaign/sign
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "country": "US",
  "city": "New York",
  "state": "NY",
  "consent_news": true,
  "turnstileToken": "cf-turnstile-token"
}
```

---

## 🧪 **Testing Results - ALL PASSED!**

We've thoroughly tested both custom domains and everything is working perfectly:

### **✅ Staging Domain Tests**
- **SSL Certificate:** ✅ Valid and secure
- **Health Check:** ✅ Responding correctly
- **CORS Headers:** ✅ Properly configured for staging frontend
- **Petition Stats:** ✅ Working (0 confirmed signatures)
- **API Endpoints:** ✅ All endpoints responding correctly

### **✅ Production Domain Tests**
- **SSL Certificate:** ✅ Valid and secure
- **Health Check:** ✅ Responding correctly
- **CORS Headers:** ✅ Properly configured for production frontend
- **Petition Stats:** ✅ Working (0 confirmed, 1 pending, 1 total signatures)
- **API Endpoints:** ✅ All endpoints responding correctly

---

## 🔒 **CORS Configuration**

The backend is configured to accept requests from your frontend domains:

```javascript
// Allowed Origins (already configured)
corsOrigins: [
  'https://petition.motherofpeace.com',                       // Production frontend
  'https://staging.petition.motherofpeace.com',              // Staging frontend
  'https://hsa-petitions.vercel.app',                        // Stable frontend domain
  'https://hsa-petitions-api.vercel.app',                    // Stable backend domain
  // ... plus all Vercel domains for backward compatibility
]
```

**CORS Headers Returned:**
```http
Access-Control-Allow-Origin: <your-frontend-domain>
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
Access-Control-Allow-Credentials: true
```

---

## 🛡️ **Security Features Active**

- **✅ Rate Limiting:** 3 requests per hour per IP+UserAgent
- **✅ Turnstile Protection:** Cloudflare bot protection
- **✅ Input Validation:** Comprehensive request validation
- **✅ Disposable Email Detection:** Blocks temporary email services
- **✅ Duplicate Prevention:** Prevents multiple signatures per phone/email
- **✅ CORS Protection:** Only allows configured origins

---

## 📝 **Integration Examples**

### **Frontend API Integration**
```javascript
// Example: Sign petition
const signPetition = async (formData) => {
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.petition.motherofpeace.com'
    : 'https://staging.api.petition.motherofpeace.com';

  try {
    const response = await fetch(`${API_BASE_URL}/api/petitions/campaign/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        country: formData.country,
        city: formData.city,
        state: formData.state,
        consent_news: formData.consentNews,
        turnstileToken: formData.turnstileToken
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      // Success: Show thank you message
      console.log('Petition signed successfully:', result.data);
    } else {
      // Error: Handle validation or other errors
      console.error('Error signing petition:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### **Get Petition Statistics**
```javascript
// Example: Get current signature count
const getPetitionStats = async () => {
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.petition.motherofpeace.com'
    : 'https://staging.api.petition.motherofpeace.com';

  try {
    const response = await fetch(`${API_BASE_URL}/api/petitions/campaign/stats`);
    const result = await response.json();
    
    if (result.ok) {
      return result.data.confirmed_count;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};
```

---

## 🚀 **Next Steps for Frontend Team**

### **Immediate Actions**
1. **✅ Update API Base URLs** to use the new custom domains
2. **✅ Test Integration** with both staging and production APIs
3. **✅ Update Environment Variables** for different environments
4. **✅ Test CORS** with your frontend domains

### **Environment Configuration**
```javascript
// Example environment configuration
const config = {
  development: {
    apiUrl: 'https://staging.api.petition.motherofpeace.com',
    frontendUrl: 'https://staging.petition.motherofpeace.com'
  },
  production: {
    apiUrl: 'https://api.petition.motherofpeace.com',
    frontendUrl: 'https://petition.motherofpeace.com'
  }
};
```

---

## 📊 **Response Format**

All API responses follow this consistent format:

### **Success Response**
```json
{
  "ok": true,
  "data": {
    "signature_id": "uuid-string",
    "confirm_token": "confirmation-token-or-null",
    "message": "Thank you for signing the petition!"
  }
}
```

### **Error Response**
```json
{
  "ok": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```

---

## 🧪 **Testing Your Integration**

### **Test Staging Environment**
```bash
# Health check
curl https://staging.api.petition.motherofpeace.com/health

# Petition stats
curl https://staging.api.petition.motherofpeace.com/api/petitions/campaign/stats
```

### **Test Production Environment**
```bash
# Health check
curl https://api.petition.motherofpeace.com/health

# Petition stats
curl https://api.petition.motherofpeace.com/api/petitions/campaign/stats
```

---

## 🆘 **Support & Troubleshooting**

### **Common Issues & Solutions**

#### **CORS Errors**
- **Symptom:** `Not allowed by CORS` error
- **Solution:** Ensure your frontend domain is in the CORS origins list
- **Check:** Origin header matches exactly (including protocol)

#### **Rate Limiting**
- **Symptom:** `Too Many Requests` error
- **Solution:** Wait for rate limit window to reset (1 hour)
- **Note:** This is per IP+UserAgent combination

#### **Validation Errors**
- **Symptom:** `Invalid input` with details array
- **Solution:** Check the validation details for specific field requirements
- **Common:** Phone format, email format, required fields

---

## 📞 **Contact Information**

For any questions or issues during integration:

- **Backend Repository:** `hsa_religious_freedom_leadpage_backend`
- **Documentation:** See `docs/PRODUCTION_SETUP.md` for detailed setup
- **API Testing:** Use the provided curl commands or Postman

---

## 🎯 **Integration Checklist**

- [ ] Update frontend API base URLs to custom domains
- [ ] Test staging environment integration
- [ ] Test production environment integration
- [ ] Implement proper error handling for API responses
- [ ] Test CORS with your frontend domains
- [ ] Verify Turnstile integration for bot protection
- [ ] Test petition signing flow end-to-end
- [ ] Test petition statistics display

---

## 🚀 **Ready for Production!**

Both staging and production backend APIs are **100% ready** for your frontend integration. All endpoints are tested, secured, and operational with your custom domains.

**The backend is waiting for your frontend! 🎉**

---

**Best regards,**  
Backend Development Team

**P.S.** Both custom domains are live and tested. You can start integrating immediately with the provided API endpoints!
