# 🔐 Authentication Setup Guide

Your Diaspora Market Hub now has a complete authentication system with email and social login support!

## ✅ What's Already Implemented

### Authentication Features:
- ✅ **Email/Password Registration & Login**
- ✅ **Social Login Support** (Google, Facebook, GitHub)
- ✅ **Password Reset** functionality
- ✅ **Email Verification** (when Supabase is configured)
- ✅ **OAuth Callback Handling**
- ✅ **Protected Routes** and authentication state management
- ✅ **Beautiful UI** with loading states and error handling

### Pages Available:
- `/auth/signin` - Sign in with email or social providers
- `/auth/signup` - Create new account with email or social providers
- `/auth/callback` - Handles OAuth redirects (automatic)

## 🚀 Next Steps to Enable Full Authentication

### 1. Set up Supabase Project

1. **Create a Supabase project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up/Login and create a new project
   - Choose a name like "diaspora-market-hub"

2. **Get your project credentials:**
   - Go to Settings → API
   - Copy your **Project URL** and **anon public key**

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Site URL for OAuth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Configure Social Login Providers

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret
7. In Supabase: Authentication → Providers → Google → Enable and add credentials

#### Facebook OAuth:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set OAuth redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Copy App ID and App Secret
6. In Supabase: Authentication → Providers → Facebook → Enable and add credentials

#### GitHub OAuth:
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase: Authentication → Providers → GitHub → Enable and add credentials

### 4. Configure Email Settings (Optional)

In Supabase Dashboard:
1. Go to Authentication → Settings
2. Configure SMTP settings for email verification
3. Or use Supabase's built-in email service

### 5. Set up Database Schema

Run the SQL scripts in your `scripts/` folder:

```sql
-- Run these in Supabase SQL Editor
-- 1. database-setup.sql
-- 2. auth-schema.sql
-- 3. community-schema.sql
-- 4. seed-data.sql
```

## 🎯 Testing Your Authentication

### Test Email/Password Auth:
1. Visit `http://localhost:3000/auth/signup`
2. Create a new account
3. Check your email for verification (if configured)
4. Sign in at `http://localhost:3000/auth/signin`

### Test Social Login:
1. Click any social login button (Google, Facebook, GitHub)
2. Complete OAuth flow
3. You'll be redirected back and signed in automatically

### Test Password Reset:
1. Go to sign-in page
2. Click "Forgot password?"
3. Enter your email
4. Check email for reset link

## 🔧 Customization Options

### Add More Social Providers:
Supported providers: `google`, `facebook`, `github`, `twitter`, `discord`, `slack`, `azure`, `bitbucket`, `gitlab`, `linkedin`, `notion`, `twitch`, `spotify`, `zoom`

### Customize User Profile:
- Add more fields to the signup form
- Update the user metadata structure
- Add profile picture upload

### Add Role-Based Access:
- Create user roles (admin, moderator, user)
- Add role-based route protection
- Implement permission checks

## 🛡️ Security Best Practices

1. **Environment Variables:** Never commit `.env.local` to version control
2. **CORS Settings:** Configure allowed origins in Supabase
3. **Rate Limiting:** Enable rate limiting for auth endpoints
4. **Email Verification:** Require email verification for new accounts
5. **Password Policy:** Enforce strong password requirements

## 🚨 Troubleshooting

### Common Issues:

1. **"Authentication not configured" error:**
   - Check your `.env.local` file
   - Ensure Supabase URL and key are correct

2. **Social login not working:**
   - Verify OAuth credentials in Supabase
   - Check redirect URIs are correct
   - Ensure provider is enabled in Supabase

3. **Email verification not sending:**
   - Configure SMTP settings in Supabase
   - Check spam folder
   - Verify email templates

4. **CORS errors:**
   - Add your domain to Supabase allowed origins
   - Check browser console for specific errors

## 📞 Support

If you encounter issues:
1. Check the Supabase documentation
2. Review browser console for errors
3. Verify all environment variables are set correctly
4. Test with a fresh browser session

---

**Your authentication system is ready to use!** 🎉

Once you complete the Supabase setup, users will be able to:
- Register with email/password
- Sign in with social providers
- Reset passwords
- Access protected features
- Have their sessions managed automatically 