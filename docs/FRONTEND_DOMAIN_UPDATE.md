# 🌐 **Frontend Domain Update - New Official Domain**

**Date:** September 9, 2025  
**From:** Backend Team  
**To:** Frontend Team  
**Subject:** API Updated for New Domain - https://petition.motherofpeace.com/

---

## 🎉 **Domain Update Complete!**

The backend API has been updated to support your new official domain: **[https://petition.motherofpeace.com/](https://petition.motherofpeace.com/)**

---

## 📍 **Updated API Information**

### **New Production API URL:**
```
https://hsa-religious-freedom-leadpage-backend-xkzecpdt6.vercel.app
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

## ✅ **CORS Configuration Updated**

The API now accepts requests from:
- ✅ **https://petition.motherofpeace.com** (NEW - Your official domain)
- ✅ **https://hsa-petitions.vercel.app** (Previous stable domain)
- ✅ **https://religiousfreedom.vercel.app** (Original domain)
- ✅ All Vercel subdomains (fallback)

---

## 🔧 **Environment Variables to Update**

### **For Your Frontend (.env or environment config):**
```bash
# Update your API base URL
NEXT_PUBLIC_API_BASE_URL=https://hsa-religious-freedom-leadpage-backend-xkzecpdt6.vercel.app

# Update your petition slug
NEXT_PUBLIC_PETITION_SLUG=petition-for-the-mother-of-peace

# Update your domain for CORS
NEXT_PUBLIC_APP_ORIGIN=https://petition.motherofpeace.com
```

### **For Your Backend (if you have one):**
```bash
# Update the APP_ORIGIN to your new domain
APP_ORIGIN=https://petition.motherofpeace.com
```

---

## 🧪 **Testing with New Domain**

### **Test Request:**
```bash
curl -X POST https://hsa-religious-freedom-leadpage-backend-xkzecpdt6.vercel.app/api/petitions/petition-for-the-mother-of-peace/sign \
  -H "Content-Type: application/json" \
  -H "Origin: https://petition.motherofpeace.com" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "phone": "2017073999",
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
    "signature_id": "c4011e36-91ba-4e14-a24e-4e...",
    "confirm_token": null,
    "message": "Thank you for signing the petition!"
  }
}
```

---

## 🔄 **Frontend Integration Code**

### **Updated JavaScript Integration:**
```javascript
const API_BASE_URL = 'https://hsa-religious-freedom-leadpage-backend-xkzecpdt6.vercel.app';
const PETITION_SLUG = 'petition-for-the-mother-of-peace';

// Your form submission
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

---

## 📊 **Current Status**

### **✅ Working Perfectly:**
- Phone-only petition submissions
- CORS for your new domain
- Database storage
- Validation
- Error handling

### **⚠️ Still Working On:**
- Email-only submissions (timeout issue)
- Stats endpoint (not critical for form submission)

---

## 🎯 **Next Steps**

### **For Frontend Team:**
1. ✅ **Update your API endpoint** to the new URL
2. ✅ **Update your environment variables**
3. ✅ **Test the integration** with your new domain
4. ✅ **Deploy and verify** everything works

### **For Backend Team:**
1. ✅ **CORS updated** for new domain
2. 🔧 **Continue fixing** email confirmation timeout
3. 🔧 **Continue fixing** stats endpoint

---

## 🎉 **Summary**

**Your new domain [https://petition.motherofpeace.com/](https://petition.motherofpeace.com/) is now fully supported!**

The API is ready to accept requests from your official petition website. All phone-based submissions will work perfectly.

**Ready for production with your new domain!** 🚀

---

**Backend Team**  
*Petition for the Mother of Peace Campaign*
