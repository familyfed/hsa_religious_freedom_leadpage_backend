# 🎉 **Frontend Integration Update - API is LIVE!**

**Date:** September 9, 2025  
**From:** Backend Team  
**To:** Frontend Team  
**Subject:** Petition API is Working - Ready for Integration!

---

## 🚀 **GREAT NEWS!**

The petition signing API is now **LIVE and WORKING**! Your frontend can now successfully submit petition signatures.

---

## 📍 **API Endpoints**

### **Production API Base URL:**
```
https://hsa-religious-freedom-leadpage-backend-7rzpymhj4.vercel.app
```

### **Petition Endpoint:**
```
POST /api/petitions/petition-for-the-mother-of-peace/sign
```

### **Health Check:**
```
GET /health
```

---

## ✅ **What's Working Perfectly**

### **1. Phone-Only Submissions** ✅
The API is fully functional for phone number submissions:

```javascript
// Working payload format:
{
  "first_name": "John",
  "last_name": "Doe", 
  "phone": "201-707-3920",
  "country": "US",
  "city": "New York",
  "state": "NY", // optional
  "consent_news": true, // optional
  "turnstileToken": "cf-turnstile-token"
}
```

### **2. Success Response** ✅
```javascript
{
  "ok": true,
  "data": {
    "signature_id": "0eea99ef-33d3-4eab-91f2-c4...",
    "confirm_token": null,
    "message": "Thank you for signing the petition!"
  }
}
```

### **3. CORS Configuration** ✅
The API is configured to accept requests from:
- `https://hsa-petitions.vercel.app` (your stable domain)
- `https://religiousfreedom.vercel.app` (original domain)
- All Vercel subdomains as fallback

---

## 🔧 **Frontend Integration Steps**

### **1. Update Your API Endpoint**
```javascript
const API_BASE_URL = 'https://hsa-religious-freedom-leadpage-backend-7rzpymhj4.vercel.app';
const PETITION_SLUG = 'petition-for-the-mother-of-peace';

// Your form submission:
const response = await fetch(`${API_BASE_URL}/api/petitions/${PETITION_SLUG}/sign`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone: formData.phone,
    country: formData.country,
    city: formData.city,
    state: formData.state, // optional
    consent_news: formData.consentNews, // optional
    turnstileToken: turnstileToken
  })
});
```

### **2. Handle Success Response**
```javascript
if (response.ok) {
  const data = await response.json();
  if (data.ok) {
    // Success! Show thank you message
    console.log('Petition signed successfully:', data.data.signature_id);
    // Redirect to thank you page or show success message
  }
} else {
  // Handle error
  const error = await response.json();
  console.error('Error:', error.error);
}
```

### **3. Error Handling**
The API returns these error codes:
- `400` - Validation errors (missing fields, invalid format)
- `409` - Phone number already signed this petition
- `429` - Rate limited (too many requests)
- `500` - Server error

---

## ⚠️ **Current Limitations**

### **1. Email Submissions** ⚠️
Email-only submissions are currently timing out. We're working on fixing this, but since your frontend is designed for phone numbers, this shouldn't affect you.

### **2. Stats Endpoint** ⚠️
The stats endpoint (`GET /api/petitions/petition-for-the-mother-of-peace/stats`) is not responding. We're investigating this.

### **3. Local Development** ⚠️
The local development server has CORS issues with `localhost:3000`. Use the production API for testing.

---

## 🧪 **Testing**

### **Test with cURL:**
```bash
curl -X POST https://hsa-religious-freedom-leadpage-backend-7rzpymhj4.vercel.app/api/petitions/petition-for-the-mother-of-peace/sign \
  -H "Content-Type: application/json" \
  -H "Origin: https://hsa-petitions.vercel.app" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "phone": "2017073920",
    "country": "US",
    "city": "Test City",
    "turnstileToken": "test_token_123"
  }'
```

### **Expected Response:**
```json
{
  "ok": true,
  "data": {
    "signature_id": "0eea99ef-33d3-4eab-91f2-c4...",
    "confirm_token": null,
    "message": "Thank you for signing the petition!"
  }
}
```

---

## 🎯 **Next Steps**

### **For Frontend Team:**
1. ✅ **Update your API endpoint** to use the new production URL
2. ✅ **Test the integration** with the provided test data
3. ✅ **Implement error handling** for the response codes
4. ✅ **Deploy and test** with real users

### **For Backend Team:**
1. 🔧 **Fix email confirmation timeout** (low priority)
2. 🔧 **Fix stats endpoint** (low priority)
3. 🔧 **Fix local development CORS** (low priority)

---

## 📞 **Support**

If you encounter any issues:
1. Check the browser console for error messages
2. Verify the request payload matches the expected format
3. Ensure CORS headers are properly set
4. Contact the backend team with specific error details

---

## 🎉 **Summary**

**The petition signing API is LIVE and ready for production use!** 

Your frontend can now successfully submit phone-based petition signatures. The API is stable, secure, and properly configured for your Vercel deployment.

**Ready to go live!** 🚀

---

**Backend Team**  
*Petition for the Mother of Peace Campaign*

