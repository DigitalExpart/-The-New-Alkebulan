# Social Media Integration Guide

This guide explains how to set up and use the social media integration feature that allows users to connect their social media accounts and import media.

## 🚀 Features

- **OAuth Integration**: Secure authentication with Instagram, Facebook, TikTok, and LinkedIn
- **Media Import**: Import photos and videos from connected social media accounts
- **Connection Management**: View, connect, and disconnect social media accounts
- **Bulk Import**: Import media from all connected platforms at once
- **Token Management**: Automatic token refresh and secure storage
- **Real-time Progress**: Upload progress tracking with MB counters

## 📋 Prerequisites

### 1. Social Media Developer Accounts

You'll need developer accounts for each platform you want to integrate:

- **Instagram**: [Facebook for Developers](https://developers.facebook.com/)
- **Facebook**: [Facebook for Developers](https://developers.facebook.com/)
- **TikTok**: [TikTok for Developers](https://developers.tiktok.com/)
- **LinkedIn**: [LinkedIn Developer Portal](https://www.linkedin.com/developers/)

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Facebook
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Encryption key for storing tokens securely (32 characters)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Site URL for OAuth redirects
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Dependencies

Install the required packages:

```bash
npm install crypto-js
npm install -D @types/crypto-js
```

## 🛠 Setup Instructions

### Step 1: Database Setup

Run the database schema script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of scripts/create-social-media-schema.sql
```

This creates:
- `social_media_connections` table
- `imported_media` table
- RLS policies for security
- Helper functions for data retrieval

### Step 2: Platform Configuration

#### Instagram Setup
1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Configure OAuth redirect URIs:
   - `https://yourdomain.com/auth/instagram/callback`
5. Get your Client ID and Client Secret

#### Facebook Setup
1. In the same Facebook app, add Facebook Login product
2. Configure OAuth redirect URIs:
   - `https://yourdomain.com/auth/facebook/callback`
3. Request permissions: `user_photos`, `user_videos`, `user_posts`

#### TikTok Setup
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Configure OAuth redirect URIs:
   - `https://yourdomain.com/auth/tiktok/callback`
4. Request permissions: `user.info.basic`, `video.list`

#### LinkedIn Setup
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Configure OAuth redirect URIs:
   - `https://yourdomain.com/auth/linkedin/callback`
4. Request permissions: `r_liteprofile`, `r_emailaddress`, `w_member_social`

### Step 3: Deploy and Test

1. Deploy your application with the new environment variables
2. Test the OAuth flow for each platform
3. Verify media import functionality

## 🎯 Usage

### For Users

1. **Connect Accounts**:
   - Go to Media Gallery → Connections tab
   - Click "Connect" for desired platforms
   - Complete OAuth flow

2. **Import Media**:
   - Click "Import Media" on connected platforms
   - Or use "Import All" to import from all platforms
   - View imported media in the gallery

3. **Manage Connections**:
   - View connection status
   - Disconnect accounts if needed
   - Re-import media anytime

### For Developers

#### API Endpoints

- `GET /api/auth/[platform]` - Initiate OAuth flow
- `GET /auth/[platform]/callback` - Handle OAuth callback

#### Key Components

- `SocialMediaConnections` - Main connection management component
- `SocialMediaAuth` - Authentication and token management
- `SocialMediaImporter` - Media import functionality

#### Database Functions

```sql
-- Get user's social media connections
SELECT * FROM get_user_social_connections('user-uuid');

-- Get imported media statistics
SELECT * FROM get_imported_media_stats('user-uuid');
```

## 🔒 Security Features

- **Token Encryption**: All access tokens are encrypted before storage
- **Row Level Security**: Users can only access their own data
- **Token Refresh**: Automatic token refresh when expired
- **Secure OAuth**: Proper OAuth 2.0 implementation

## 🚨 Important Notes

### API Limitations

- **Rate Limits**: Each platform has different rate limits
- **Data Access**: Some platforms restrict media access
- **Token Expiration**: Tokens expire and need refresh

### Legal Compliance

- **Terms of Service**: Must comply with each platform's ToS
- **Data Privacy**: GDPR/CCPA compliance for user data
- **Content Rights**: Respect copyright and usage rights

### Production Considerations

- **Error Handling**: Implement proper error handling
- **Monitoring**: Monitor API usage and errors
- **Backup**: Regular backup of connection data
- **Testing**: Test with real accounts before production

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Errors**:
   - Check redirect URIs match exactly
   - Verify client IDs and secrets
   - Ensure app is approved for production

2. **Import Failures**:
   - Check token validity
   - Verify API permissions
   - Check rate limits

3. **Database Errors**:
   - Ensure RLS policies are correct
   - Check user permissions
   - Verify table structure

### Debug Tools

- Use `/debug-supabase` page for connection testing
- Check browser console for API errors
- Monitor Supabase logs for database issues

## 📈 Future Enhancements

- **Auto-sync**: Periodic media synchronization
- **Advanced Filters**: Filter imported media by date, type, etc.
- **Batch Operations**: Bulk operations on imported media
- **Analytics**: Import statistics and usage analytics
- **More Platforms**: Support for additional social media platforms

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Check Supabase logs for database issues
4. Test with the debug tools provided

---

**Note**: This integration requires proper API approval from each platform for production use. Test thoroughly in development before deploying to production.
