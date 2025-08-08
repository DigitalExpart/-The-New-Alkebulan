# Database Troubleshooting Guide

This guide helps you diagnose and fix common database issues in your Diaspora Market Hub application.

## Quick Diagnosis

If you're experiencing database errors, follow these steps in order:

### Step 1: Run the Diagnostic Script

Copy and paste the contents of `scripts/database-diagnostic-and-fix.sql` into your **Supabase SQL Editor** and run it. This script will:

- ✅ Check if the `posts` table exists
- ✅ Check if the `profiles` table exists and its structure
- ✅ Create missing tables if needed
- ✅ Fix foreign key constraint issues
- ✅ Enable Row Level Security (RLS)
- ✅ Create proper RLS policies
- ✅ Add performance indexes
- ✅ Set up triggers for `updated_at` timestamps

### Step 2: If RLS Policies Are Blocking

If you're still getting permission errors after Step 1, run the contents of `scripts/rls-policy-adjustments.sql` in your Supabase SQL Editor. This script:

- 🔓 Makes policies more permissive for debugging
- 🔓 Allows public read access to profiles
- 🔓 Allows authenticated users to view all posts
- 🔓 Includes options to temporarily disable RLS (for testing only)

### Step 3: Manual Table Creation (if needed)

If the diagnostic script doesn't work, you can manually run the social feed schema:

1. Copy and paste `scripts/social-feed-schema-fixed.sql` into your Supabase SQL Editor
2. Run the script to create all social feed tables

## Common Issues and Solutions

### Issue: "Database error saving new user"

**Cause**: Missing `profiles` table or incorrect foreign key constraints

**Solution**: Run `scripts/database-diagnostic-and-fix.sql`

### Issue: "Posts table does not exist"

**Cause**: The social feed tables haven't been created

**Solution**: Run `scripts/social-feed-schema-fixed.sql`

### Issue: "Permission denied" or RLS policy errors

**Cause**: Row Level Security policies are too restrictive

**Solution**: Run `scripts/rls-policy-adjustments.sql`

### Issue: Foreign key constraint errors

**Cause**: Incorrect constraint relationships between tables

**Solution**: Run `scripts/complete-database-setup.sql`

## Database Structure Overview

### Core Tables

1. **`profiles`** - User profile information
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `full_name`, `avatar_url`, `bio`, etc.

2. **`posts`** - Social feed posts
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `content`, `image_url`, `privacy`, etc.

3. **`post_likes`** - Post likes
   - Links users to posts they've liked

4. **`post_comments`** - Post comments
   - Supports nested comments with `parent_comment_id`

5. **`post_shares`** - Post shares/reposts
   - Tracks how posts are shared

6. **`comment_likes`** - Comment likes
   - Links users to comments they've liked

### Key Relationships

- All tables reference `auth.users(id)` for user identification
- Posts cascade delete to likes, comments, and shares
- Comments can have parent comments (nested structure)

## RLS Policy Structure

### Profiles Policies
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile
- Public can view profiles (for display)

### Posts Policies
- Public posts are viewable by everyone
- Users can view their own posts
- Users can create/update/delete their own posts

### Interaction Policies
- Users can like/comment on posts they can see
- Users can only modify their own interactions

## Performance Indexes

The scripts automatically create indexes for:
- `user_id` columns (for user-specific queries)
- `created_at` columns (for chronological ordering)
- `post_id` columns (for post-related queries)
- `privacy` columns (for privacy filtering)

## Testing Your Setup

After running the scripts, test your database with these queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('profiles', 'posts', 'post_likes', 'post_comments');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('profiles', 'posts');

-- Test inserting a profile (replace with actual user_id)
INSERT INTO profiles (user_id, full_name) 
VALUES ('your-user-id-here', 'Test User');
```

## Emergency Recovery

If everything is broken and you need to start fresh:

1. **Backup your data** (if any exists)
2. Run `scripts/complete-database-setup.sql`
3. If that fails, manually run each script in this order:
   - `scripts/social-feed-schema-fixed.sql`
   - `scripts/complete-database-setup.sql`
   - `scripts/rls-policy-adjustments.sql`

## Getting Help

If you're still experiencing issues:

1. Check the Supabase logs in your dashboard
2. Verify your environment variables are set correctly
3. Ensure your Supabase project is properly configured
4. Check that your application is using the correct Supabase URL and keys

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Security Notes

⚠️ **Important**: The RLS adjustment script includes options to temporarily disable RLS for debugging. **Never use this in production** - it will disable all security policies.

Always re-enable RLS and proper policies before deploying to production. 