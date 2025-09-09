# 🚀 Vercel Environment Variables Setup

**Email:** `media@unification.org`  
**Frontend:** `https://religiousfreedom.vercel.app`  
**Backend:** `https://religiousfreedombackend.vercel.app`

## 📋 **Required Environment Variables**

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

### **🔴 REQUIRED Variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase service role key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anonymous key |
| `RESEND_API_KEY` | `re_1234567890abcdef...` | Resend email service API key |
| `TURNSTILE_SECRET_KEY` | `0x4AAAAAAABkMYinukE8nz...` | Cloudflare Turnstile secret key |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | JWT signing secret (32+ chars) |
| `ADMIN_API_KEY` | `admin-secret-key-12345` | Admin API key for CSV exports |

### **🟡 RECOMMENDED Variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `APP_ORIGIN` | `https://religiousfreedom.vercel.app` | Frontend domain for CORS |
| `EMAIL_FROM` | `Petitions <media@unification.org>` | Email sender address |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAAAAAABkMYinukE8nz...` | Turnstile site key for frontend |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `religiousfreedom.vercel.app` | Analytics domain |

## 🔧 **Step-by-Step Setup**

### **1. Supabase Configuration**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### **2. Resend Email Service**
1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Sign up/login with `media@unification.org`
3. Go to **API Keys**
4. Create new API key → `RESEND_API_KEY`
5. Verify domain `unification.org` in Resend

### **3. Cloudflare Turnstile**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Turnstile**
3. Create new site for `religiousfreedom.vercel.app`
4. Copy:
   - **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret Key** → `TURNSTILE_SECRET_KEY`

### **4. Generate Secrets**
```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate Admin API Key
openssl rand -hex 32
```

### **5. Add to Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `religiousfreedombackend`
3. Go to **Settings → Environment Variables**
4. Add each variable above
5. Set environment to **Production** for all

## 📧 **Email Configuration**

### **Resend Setup for Unification.org**
1. **Add Domain:** In Resend dashboard, add `unification.org`
2. **Verify Domain:** Add DNS records as instructed
3. **API Key:** Generate API key for `media@unification.org`
4. **From Address:** Use `Petitions <media@unification.org>`

### **Email Templates**
The system will send:
- **Confirmation emails** from `Petitions <media@unification.org>`
- **Thank you emails** from `Petitions <media@unification.org>`

## 🧪 **Test After Setup**

Once all variables are set, test your API:

```bash
# Run the test script
node scripts/test-production.js

# Or use the bash version
./scripts/test-production.sh
```

## 🔍 **Expected Results**

After setting environment variables:
- ✅ Health check should return 200
- ✅ Petition stats should work
- ✅ Email validation should work
- ✅ Petition signing should work (with valid Turnstile token)

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Missing required environment variable"**
   - Check all required variables are set
   - Ensure variable names match exactly

2. **Email not sending**
   - Verify Resend API key is valid
   - Check domain verification in Resend
   - Ensure `EMAIL_FROM` format is correct

3. **CORS errors**
   - Verify `APP_ORIGIN` is set to `https://religiousfreedom.vercel.app`
   - Check frontend is making requests to correct backend URL

4. **Database connection issues**
   - Verify Supabase keys are correct
   - Check if database tables are created

## 📊 **Production URLs**

After setup, your API will be available at:
- **Health:** `https://religiousfreedombackend.vercel.app/health`
- **Petition Sign:** `https://religiousfreedombackend.vercel.app/api/petitions/campaign/sign`
- **Petition Stats:** `https://religiousfreedombackend.vercel.app/api/petitions/campaign/stats`

## 🔐 **Security Notes**

- Never commit environment variables to git
- Use strong, unique secrets for production
- Regularly rotate API keys
- Monitor API usage and logs
- Enable Vercel's security features

---

**Ready to deploy with Unification.org email! 🚀**
