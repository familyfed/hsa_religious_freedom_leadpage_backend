# 🎯 **Frontend Team - Complete Turnstile Implementation Guide**

**Date:** September 17, 2025  
**From:** Backend Development Team  
**To:** Frontend Development Team  
**Subject:** Complete Turnstile Implementation - Everything You Need to Know  

---

## 🎉 **Backend Status: 100% Ready**

The backend Turnstile integration is **completely working** and ready for production. This guide contains everything you need to implement the frontend correctly.

---

## 📋 **What You Need to Implement**

### **1. Turnstile Widget Setup**
```html
<!-- Add this script to your HTML head -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

```html
<!-- Add this div where you want the Turnstile widget -->
<div class="cf-turnstile" 
     data-sitekey="0x4AAAAAAABkMYinukE8nzY" 
     data-callback="onTurnstileSuccess"
     data-error-callback="onTurnstileError"
     data-expired-callback="onTurnstileExpired">
</div>
```

### **2. JavaScript Implementation**
```javascript
// Global variables
let turnstileToken = null;
let isSubmitting = false;

// Turnstile callbacks
function onTurnstileSuccess(token) {
    console.log('✅ Turnstile completed:', token);
    turnstileToken = token;
    // Enable submit button
    document.getElementById('submitBtn').disabled = false;
}

function onTurnstileError(error) {
    console.error('❌ Turnstile error:', error);
    turnstileToken = null;
    // Disable submit button
    document.getElementById('submitBtn').disabled = true;
}

function onTurnstileExpired() {
    console.log('⏰ Turnstile expired');
    turnstileToken = null;
    // Disable submit button
    document.getElementById('submitBtn').disabled = true;
}

// Get fresh token for submission
function getFreshToken() {
    if (!turnstileToken) {
        throw new Error('Please complete the security check');
    }
    return turnstileToken;
}

// Reset Turnstile widget
function resetTurnstile() {
    if (window.turnstile) {
        window.turnstile.reset();
        turnstileToken = null;
        document.getElementById('submitBtn').disabled = true;
    }
}

// Form submission
async function submitPetitionForm(event) {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
        return;
    }
    
    isSubmitting = true;
    
    try {
        // Get fresh token
        const freshToken = getFreshToken();
        
        // Get form data
        const formData = {
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            consent_news: document.getElementById('consentNews').checked,
            turnstileToken: freshToken
        };
        
        // Submit to backend
        const response = await fetch('/api/petitions/petition-for-the-mother-of-peace/sign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.ok) {
            // Success - show success message
            showSuccessMessage('Petition signed successfully!');
            // Reset form and Turnstile
            document.getElementById('petitionForm').reset();
            resetTurnstile();
        } else {
            // Error - show error message
            showErrorMessage(result.error);
            // Reset Turnstile for retry
            resetTurnstile();
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        showErrorMessage('Please complete the security check and try again.');
        resetTurnstile();
    } finally {
        isSubmitting = false;
    }
}

// Helper functions
function showSuccessMessage(message) {
    // Implement your success message display
    alert(message); // Replace with your UI
}

function showErrorMessage(message) {
    // Implement your error message display
    alert('Error: ' + message); // Replace with your UI
}

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('petitionForm');
    if (form) {
        form.addEventListener('submit', submitPetitionForm);
    }
    
    // Disable submit button initially
    document.getElementById('submitBtn').disabled = true;
});
```

### **3. HTML Form Structure**
```html
<form id="petitionForm">
    <div class="form-group">
        <label for="firstName">First Name *</label>
        <input type="text" id="firstName" name="firstName" required>
    </div>
    
    <div class="form-group">
        <label for="lastName">Last Name *</label>
        <input type="text" id="lastName" name="lastName" required>
    </div>
    
    <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" name="email" required>
    </div>
    
    <div class="form-group">
        <label for="country">Country *</label>
        <select id="country" name="country" required>
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <!-- Add more countries -->
        </select>
    </div>
    
    <div class="form-group">
        <label for="city">City *</label>
        <input type="text" id="city" name="city" required>
    </div>
    
    <div class="form-group">
        <label for="state">State/Province</label>
        <input type="text" id="state" name="state">
    </div>
    
    <div class="form-group">
        <label>
            <input type="checkbox" id="consentNews" name="consentNews">
            I would like to receive updates about this petition
        </label>
    </div>
    
    <!-- Turnstile Widget -->
    <div class="form-group">
        <div class="cf-turnstile" 
             data-sitekey="0x4AAAAAAABkMYinukE8nzY" 
             data-callback="onTurnstileSuccess"
             data-error-callback="onTurnstileError"
             data-expired-callback="onTurnstileExpired">
        </div>
    </div>
    
    <button type="submit" id="submitBtn" disabled>
        Sign Petition
    </button>
</form>
```

---

## 🔧 **Critical Implementation Points**

### **1. Token Management**
- **Always get fresh token** for each submission
- **Reset widget** after each submission (success or failure)
- **Never reuse tokens** - they become invalid after first use

### **2. Error Handling**
- **Handle token expiry** gracefully
- **Reset widget** on any error
- **Show clear error messages** to users

### **3. User Experience**
- **Disable submit button** until Turnstile is completed
- **Re-enable submit button** after Turnstile completion
- **Reset form and widget** after successful submission

### **4. Security**
- **Validate all form fields** before submission
- **Check token exists** before submitting
- **Handle network errors** gracefully

---

## 🧪 **Testing Checklist**

### **✅ Test Cases to Verify:**

1. **Fresh Token Submission**
   - Complete Turnstile challenge
   - Submit form immediately
   - Expected: ✅ Success

2. **Token Reuse Prevention**
   - Submit form once
   - Try to submit again without resetting
   - Expected: ❌ "Please complete the security check"

3. **Token Expiry Handling**
   - Complete Turnstile challenge
   - Wait 10+ minutes
   - Try to submit
   - Expected: ❌ "Please complete the security check"

4. **Widget Reset After Success**
   - Submit form successfully
   - Widget should reset automatically
   - Expected: ✅ Fresh widget ready for next submission

5. **Widget Reset After Error**
   - Submit form with error
   - Widget should reset automatically
   - Expected: ✅ Fresh widget ready for retry

---

## 📊 **API Endpoints**

### **Staging Environment:**
```
POST https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/sign
```

### **Production Environment:**
```
POST https://api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/sign
```

### **Request Format:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "country": "US",
  "city": "New York",
  "state": "NY",
  "consent_news": true,
  "turnstileToken": "0.abc123..."
}
```

### **Success Response:**
```json
{
  "ok": true,
  "data": {
    "signature_id": "uuid-here",
    "confirm_token": "token-here",
    "message": "Please check your email to confirm your signature"
  }
}
```

### **Error Response:**
```json
{
  "ok": false,
  "error": "Bot check failed"
}
```

---

## 🚨 **Common Issues and Solutions**

### **Issue 1: "Bot check failed" Error**
**Cause:** Token has been used or expired
**Solution:** Reset Turnstile widget and get fresh token

### **Issue 2: Submit Button Disabled**
**Cause:** Turnstile not completed
**Solution:** Complete the Turnstile challenge first

### **Issue 3: Token Not Generated**
**Cause:** Turnstile widget not loaded or error
**Solution:** Check console for errors, ensure script is loaded

### **Issue 4: Multiple Submissions**
**Cause:** No prevention mechanism
**Solution:** Use `isSubmitting` flag to prevent duplicates

---

## 🎯 **Environment Configuration**

### **Staging:**
- **Site Key:** `0x4AAAAAAABkMYinukE8nzY`
- **API URL:** `https://staging.api.petition.motherofpeace.com`
- **Domain:** `staging.petition.motherofpeace.com`

### **Production:**
- **Site Key:** `0x4AAAAAAABkMYinukE8nzY` (same)
- **API URL:** `https://api.petition.motherofpeace.com`
- **Domain:** `petition.motherofpeace.com`

---

## 📞 **Support**

If you encounter any issues:
1. **Check browser console** for JavaScript errors
2. **Verify Turnstile widget** is loading correctly
3. **Test with staging** before production
4. **Contact backend team** for API issues

---

## 🎉 **Summary**

**The backend is 100% ready!** Follow this guide exactly, and your Turnstile integration will work perfectly.

### **Key Points:**
- ✅ **Backend is working** - no changes needed
- ✅ **Use fresh tokens** for each submission
- ✅ **Reset widget** after each submission
- ✅ **Handle errors** gracefully
- ✅ **Test thoroughly** before production

---

**This implementation will work perfectly with our backend!** 🚀

---

**Best regards,**  
Backend Development Team

**P.S.** This guide contains everything you need. Follow it exactly, and the integration will work flawlessly! 🎯
