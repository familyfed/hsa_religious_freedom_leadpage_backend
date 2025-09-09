# 🚀 Vercel Deployment Guide

This guide covers deploying the HSA Religious Freedom Petition Backend API to Vercel.

## 📋 Required Environment Variables

Add these environment variables in your Vercel dashboard under **Settings > Environment Variables**:

### 🔴 **REQUIRED Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `RESEND_API_KEY` | Resend email service API key | `re_1234567890abcdef...` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | `0x4AAAAAAABkMYinukE8nz...` |
| `JWT_SECRET` | JWT signing secret (generate random) | `your-super-secret-jwt-key-here` |
| `ADMIN_API_KEY` | Admin API key for CSV exports | `admin-secret-key-12345` |

### 🟡 **OPTIONAL Variables**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `APP_ORIGIN` | Frontend domain for CORS | `http://localhost:3000` | `https://yourdomain.com` |
| `EMAIL_FROM` | Email sender address | `Petitions <no-reply@example.com>` | `Petitions <no-reply@yourdomain.com>` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (for frontend) | - | `0x4AAAAAAABkMYinukE8nz...` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain | - | `yourdomain.com` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `3600000` (1 hour) | `3600000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `3` | `5` |
| `NODE_ENV` | Environment | `development` | `production` |
| `PORT` | Server port | `3021` | `3000` |

## 🔧 **How to Get Your Keys**

### **Supabase Keys**
1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### **Resend API Key**
1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** section
3. Create new API key → `RESEND_API_KEY`

### **Cloudflare Turnstile**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Turnstile**
3. Create new site
4. Copy:
   - **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret Key** → `TURNSTILE_SECRET_KEY`

### **Generate Secrets**
```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate Admin API Key
openssl rand -hex 32
```

## 🚀 **Deployment Steps**

### **1. Connect Repository**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select the repository: `hsa_religious_freedom_leadpage_backend`

### **2. Configure Build Settings**
- **Framework Preset:** `Other`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### **3. Add Environment Variables**
1. In project settings, go to **Environment Variables**
2. Add all required variables listed above
3. Set environment to **Production** for all variables

### **4. Deploy**
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your API will be available at: `https://your-project-name.vercel.app`

## 📝 **Vercel Configuration File**

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🔍 **Testing Your Deployment**

### **Health Check**
```bash
curl https://your-project-name.vercel.app/health
```

### **Test Petition Signing**
```bash
curl -X POST https://your-project-name.vercel.app/api/petitions/campaign/sign \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "country": "US",
    "city": "New York",
    "state": "NY",
    "consent_news": true,
    "turnstileToken": "test-token"
  }'
```

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"Missing required environment variable"**
   - Check all required variables are set in Vercel
   - Ensure variable names match exactly (case-sensitive)

2. **CORS errors**
   - Update `APP_ORIGIN` to your frontend domain
   - Include protocol: `https://yourdomain.com`

3. **Database connection issues**
   - Verify Supabase keys are correct
   - Check if database tables are created

4. **Email not sending**
   - Verify Resend API key is valid
   - Check `EMAIL_FROM` format

### **Environment Variable Checklist**

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `TURNSTILE_SECRET_KEY`
- [ ] `JWT_SECRET`
- [ ] `ADMIN_API_KEY`
- [ ] `APP_ORIGIN` (your frontend domain)
- [ ] `EMAIL_FROM` (your email address)

## 📊 **Production URLs**

After deployment, your API endpoints will be:

- **Health Check:** `https://your-project.vercel.app/health`
- **Petition Sign:** `https://your-project.vercel.app/api/petitions/[slug]/sign`
- **Petition Stats:** `https://your-project.vercel.app/api/petitions/[slug]/stats`
- **Admin CSV:** `https://your-project.vercel.app/api/admin/signatures.csv?petition=[slug]`

## 🔐 **Security Notes**

- Never commit environment variables to git
- Use strong, unique secrets for production
- Regularly rotate API keys
- Monitor API usage and logs
- Enable Vercel's security features

---

**Ready to deploy! 🚀**
