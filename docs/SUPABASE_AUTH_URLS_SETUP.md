# Supabase Authentication URLs Setup

## 🔧 **Required Supabase Configuration**

To fix password reset and OAuth authentication, you need to update these settings in your Supabase Dashboard:

### **Step 1: Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Select your project: `tywtrkzlcwqdykyndzvl`
3. Go to: **Authentication** → **Settings**

### **Step 2: Update Site URL**
Set the **Site URL** to:
```
https://thenewalkebulan.com
```

### **Step 3: Update Redirect URLs**
Add these URLs to the **Redirect URLs** list:
```
https://thenewalkebulan.com/auth/callback
https://thenewalkebulan.com/auth/reset-password
https://thenewalkebulan.com/auth/signin
https://thenewalkebulan.com/dashboard
```

For local development, also add:
```
http://localhost:3001/auth/callback
http://localhost:3001/auth/reset-password
```

### **Step 4: Email Template Settings**
Go to **Authentication** → **Email Templates** → **Reset Password**

Update the template to use:
```
{{ .SiteURL }}/auth/callback?type=recovery&access_token={{ .TokenHash }}&refresh_token={{ .RefreshTokenHash }}
```

## 🧪 **Test Password Reset**

After updating the settings:

1. **Go to sign in page** (`/auth/signin`)
2. **Click "Forgot Password"**
3. **Enter your email**
4. **Check email** - link should now point to `thenewalkebulan.com`
5. **Click the link** - should redirect to working password reset form

## ✅ **Expected Flow**

1. **User clicks "Forgot Password"** → Email sent with production URL
2. **User clicks email link** → Redirects to `thenewalkebulan.com/auth/callback`
3. **Callback page detects password reset** → Redirects to `/auth/reset-password`
4. **User sets new password** → Redirects to `/dashboard`

## 🔐 **Security Notes**

- All URLs use HTTPS for security
- Tokens are properly validated before allowing password reset
- Invalid/expired links show clear error messages
- Users are redirected appropriately after successful reset

## 🌍 **Production Ready**

This configuration works for:
- ✅ Production website (`thenewalkebulan.com`)
- ✅ Local development (`localhost:3001`)
- ✅ Password reset emails
- ✅ OAuth provider callbacks
- ✅ All authentication flows
