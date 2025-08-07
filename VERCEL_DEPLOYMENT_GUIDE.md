# 🚀 Vercel Deployment Guide for Diaspora Market Hub

## Prerequisites
- ✅ Your code is already pushed to GitHub: [https://github.com/DigitalExpart/-The-New-Alkebulan.git](https://github.com/DigitalExpart/-The-New-Alkebulan.git)
- ✅ Supabase project is set up
- ✅ Environment variables are ready

## Step 1: Sign Up for Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Click "Sign Up"** (top right)
3. **Choose "Continue with GitHub"** (recommended)
4. **Authorize Vercel** to access your GitHub account

## Step 2: Import Your Repository

1. **Click "New Project"** on Vercel dashboard
2. **Find your repository**: `DigitalExpart/-The-New-Alkebulan`
3. **Click "Import"**

## Step 3: Configure Project Settings

### **Framework Preset**
- **Framework Preset**: `Next.js` (should auto-detect)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `pnpm build` (or leave as default)
- **Output Directory**: `.next` (leave as default)
- **Install Command**: `pnpm install` (or leave as default)

### **Environment Variables**
Add these environment variables in the Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://tywtrkzlcwqdykyndzvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**To get your Supabase anon key:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **anon public** key (not the service_role key)

## Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for build** (usually 2-5 minutes)
3. **Your app will be live** at a URL like: `https://your-project-name.vercel.app`

## Step 5: Configure Custom Domain (Optional)

1. **Go to your project settings** in Vercel
2. **Click "Domains"**
3. **Add your custom domain** (if you have one)
4. **Update DNS records** as instructed

## Step 6: Set Up Supabase for Production

### **Update Supabase Auth Settings**

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication** → **URL Configuration**
3. **Add your Vercel URL** to the Site URL:
   ```
   https://your-project-name.vercel.app
   ```
4. **Add redirect URLs**:
   ```
   https://your-project-name.vercel.app/auth/callback
   https://your-project-name.vercel.app/dashboard
   ```

### **Enable Social Login (Optional)**

If you want Google/GitHub login to work in production:

1. **Go to Authentication** → **Providers**
2. **Configure Google/GitHub** with your production URLs
3. **Update OAuth redirect URLs** in Google Cloud Console/GitHub

## Step 7: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test signup/signin**
3. **Test all major features**
4. **Check for any console errors**

## Troubleshooting

### **Build Errors**
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

### **Environment Variable Issues**
- Double-check variable names (case-sensitive)
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding environment variables

### **Authentication Issues**
- Verify Supabase URL and keys
- Check redirect URLs in Supabase settings
- Ensure email confirmation is configured

### **Database Issues**
- Run the database schema scripts in Supabase SQL Editor
- Check Row Level Security (RLS) policies
- Verify table permissions

## Post-Deployment Checklist

- ✅ **Homepage loads correctly**
- ✅ **Authentication works** (signup/signin)
- ✅ **Dashboard accessible** after login
- ✅ **All pages load without errors**
- ✅ **Mobile responsiveness** works
- ✅ **Database operations** function properly

## Support

If you encounter issues:
1. **Check Vercel build logs**
2. **Check browser console** for errors
3. **Verify Supabase connection**
4. **Review environment variables**

## Your Vercel URL
Once deployed, your app will be available at:
`https://your-project-name.vercel.app`

---

**🎉 Congratulations! Your Diaspora Market Hub is now live on the internet!** 