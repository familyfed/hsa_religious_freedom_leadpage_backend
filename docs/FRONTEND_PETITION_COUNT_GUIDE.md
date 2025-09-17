# 📊 **Frontend Team - Petition Count Integration Guide**

**Date:** September 17, 2025  
**From:** Backend Development Team  
**To:** Frontend Development Team  
**Subject:** How to Get Petition Count from Backend API  

---

## 🎯 **Overview**

This guide explains how to properly fetch the petition count from the backend API for the "petition-for-the-mother-of-peace" petition.

---

## 📋 **Current Database Structure**

### **Petition Slug**
- **Correct Slug:** `petition-for-the-mother-of-peace` ✅
- **Title:** "Petition for the Mother of Peace"
- **Status:** Active and public with 7 confirmed signatures

### **Database View**
The petition stats are stored in a **PostgreSQL VIEW** (not a materialized view):
- **View Name:** `petition_stats`
- **Data Source:** Real-time count from `signatures` table
- **Performance:** Optimized with indexes

---

## 🔌 **API Endpoints Available**

### **1. Public Petition Stats (Recommended)**
```http
GET /api/petitions/petition-for-the-mother-of-peace/stats
```

**Response Format:**
```json
{
  "ok": true,
  "data": {
    "confirmed_count": 1234
  }
}
```

### **2. Admin Petition Stats (If you have admin access)**
```http
GET /api/admin/stats?petition=petition-for-the-mother-of-peace
```

**Response Format:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-here",
    "slug": "petition-for-the-mother-of-peace",
    "title": "Petition for the Mother of Peace",
    "confirmed_count": 7
  }
}
```

---

## 💻 **Frontend Integration Code**

### **Basic Implementation**
```javascript
// Environment configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.petition.motherofpeace.com'
  : 'https://staging.api.petition.motherofpeace.com';

// Function to get petition count
async function getPetitionCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/petitions/petition-for-the-mother-of-peace/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.ok) {
      return data.data.confirmed_count;
    } else {
      throw new Error(data.error || 'Failed to fetch petition count');
    }
  } catch (error) {
    console.error('Error fetching petition count:', error);
    return 0; // Fallback to 0
  }
}

// Usage
const count = await getPetitionCount();
console.log(`Petition count: ${count}`);
```

### **React Hook Implementation**
```javascript
import { useState, useEffect } from 'react';

function usePetitionCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/petitions/petition-for-the-mother-of-peace/stats`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.ok) {
          setCount(data.data.confirmed_count);
        } else {
          throw new Error(data.error || 'Failed to fetch petition count');
        }
      } catch (err) {
        console.error('Error fetching petition count:', err);
        setError(err.message);
        setCount(0); // Fallback
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, []);

  return { count, loading, error };
}

// Usage in component
function PetitionCounter() {
  const { count, loading, error } = usePetitionCount();

  if (loading) return <div>Loading petition count...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Petition Signatures: {count.toLocaleString()}</h2>
    </div>
  );
}
```

### **With Auto-Refresh**
```javascript
function usePetitionCountWithRefresh(intervalMs = 30000) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/petitions/petition-for-the-mother-of-peace/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ok) {
        setCount(data.data.confirmed_count);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch petition count');
      }
    } catch (err) {
      console.error('Error fetching petition count:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount(); // Initial fetch
    
    const interval = setInterval(fetchCount, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { count, loading, error, refetch: fetchCount };
}
```

---

## 🧪 **Testing the API**

### **Manual Testing**
```bash
# Test staging environment
curl "https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/stats"

# Test production environment
curl "https://api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/stats"
```

### **Expected Response**
```json
{
  "ok": true,
  "data": {
    "confirmed_count": 7
  }
}
```

---

## ⚠️ **Important Notes**

### **1. Petition Slug**
- **Use:** `petition-for-the-mother-of-peace` ✅
- **Reason:** This is the actual slug in the database with 7 confirmed signatures
- **URL:** `/api/petitions/petition-for-the-mother-of-peace/stats`

### **2. Data Source**
- **Source:** PostgreSQL VIEW (not materialized view)
- **Real-time:** Count updates immediately when signatures are added
- **Performance:** Optimized with database indexes

### **3. Rate Limiting**
- **Status:** Currently disabled for development
- **Production:** Will be enabled with reasonable limits
- **Impact:** No current restrictions on API calls

### **4. Error Handling**
- **404:** Petition not found (check slug)
- **500:** Server error (retry with backoff)
- **Network:** Handle connection issues gracefully

---

## 🔄 **Data Flow**

```
Frontend Request
       ↓
GET /api/petitions/petition-for-the-mother-of-peace/stats
       ↓
Backend API Handler
       ↓
Database Query: petition_stats VIEW
       ↓
Real-time Count Calculation
       ↓
JSON Response: {"ok": true, "data": {"confirmed_count": 1234}}
       ↓
Frontend Display
```

---

## 📊 **Performance Considerations**

### **Database View Performance**
- **Indexes:** Optimized for fast counting
- **Query:** Uses `COUNT()` with `FILTER` for confirmed signatures
- **Caching:** Consider client-side caching for frequent requests

### **Frontend Optimization**
```javascript
// Debounced refresh to avoid excessive API calls
const debouncedRefresh = useCallback(
  debounce(() => {
    fetchCount();
  }, 1000),
  []
);

// Only refresh when component is visible
useEffect(() => {
  if (document.visibilityState === 'visible') {
    fetchCount();
  }
}, [document.visibilityState]);
```

---

## 🚀 **Production Deployment**

### **Environment Variables**
```javascript
// .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.petition.motherofpeace.com

// .env.development
NEXT_PUBLIC_API_BASE_URL=https://staging.api.petition.motherofpeace.com
```

### **Error Monitoring**
```javascript
// Add error tracking
try {
  const count = await getPetitionCount();
} catch (error) {
  // Log to your error tracking service
  console.error('Petition count fetch failed:', error);
  // Fallback to cached value or 0
}
```

---

## 🎯 **Quick Start Checklist**

- [ ] Use correct slug: `petition-for-the-mother-of-peace` ✅
- [ ] Use correct endpoint: `/api/petitions/petition-for-the-mother-of-peace/stats`
- [ ] Handle errors gracefully with fallback to 0
- [ ] Implement loading states
- [ ] Consider auto-refresh for real-time updates
- [ ] Test with both staging and production URLs
- [ ] Add error monitoring for production

---

## 📞 **Support**

If you encounter any issues with the petition count API:

1. **Check the API directly:** Use curl to test the endpoint
2. **Verify the slug:** Make sure you're using `campaign`
3. **Check network tab:** Look for any HTTP errors
4. **Contact backend team:** We're ready to help!

---

**Best regards,**  
Backend Development Team

**P.S.** The API is working perfectly and ready for integration. Just make sure to use the correct slug `petition-for-the-mother-of-peace` and you'll get the real-time petition count! 🚀
