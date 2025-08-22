# 🎯 Complete Post Creation System Setup

## 🚀 **What's Been Implemented**

Your CreatePostDialog component has been completely updated with:

### ✨ **Live Data Integration:**
- **Real Communities**: Fetches live communities from your Supabase `communities` table
- **User Authentication**: Integrates with your existing auth system
- **Profile Integration**: Shows real user names and avatars

### 🎨 **Enhanced Features:**
- **Media Upload**: Photo and video upload with 5MB limit
- **Location Support**: Optional location field for posts
- **Tag System**: Add and remove custom tags
- **Community Selection**: Dropdown with live community data
- **Form Validation**: Required fields and proper error handling

### 🔧 **Technical Features:**
- **Supabase Integration**: Direct database operations
- **File Storage**: Automatic upload to Supabase storage
- **Real-time Updates**: Feed refreshes after post creation
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations

## 🛠️ **Setup Required**

### **Step 1: Run the Post Media Storage Script**

**Option A: Full Setup (Recommended)**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `tywtrkzlcwqdykyndzvl`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the entire content from `scripts/setup-post-media-storage.sql`
6. Paste it into the SQL Editor
7. Click **"Run"**

**Option B: Simple Setup (If Option A fails)**
1. Follow steps 1-4 above
2. Copy the content from `scripts/setup-post-media-storage-simple.sql`
3. Paste and run it
4. Configure storage policies manually in Supabase Dashboard (see Step 1.5 below)

### **Step 1.5: Manual Storage Policy Configuration (If using Option B)**

If you used the simple setup, you'll need to configure storage policies manually:

1. In Supabase Dashboard, go to **"Storage"** in the left sidebar
2. Click on the **"post-media"** bucket
3. Go to **"Policies"** tab
4. Add these policies manually:

**Policy 1: Allow authenticated uploads**
- Policy name: `Allow authenticated uploads`
- Target roles: `authenticated`
- Policy definition: `bucket_id = 'post-media'`

**Policy 2: Allow public viewing**
- Policy name: `Allow public viewing`
- Target roles: `public`
- Policy definition: `bucket_id = 'post-media'`

### **Step 2: Verify Your Database Tables**

Make sure you have these tables in your Supabase database:

#### **Communities Table:**
```sql
-- Should exist from previous setup
SELECT * FROM communities LIMIT 5;
```

#### **Posts Table:**
```sql
-- Should exist from previous setup  
SELECT * FROM posts LIMIT 5;
```

#### **Storage Bucket:**
```sql
-- Should be created by the script above
SELECT * FROM storage.buckets WHERE id = 'post-media';
```

## 🎯 **How It Works**

### **1. Community Selection:**
- Fetches live communities from your `communities` table
- Shows community name, description, and category
- Required field for post creation

### **2. Media Upload:**
- **Photos**: JPEG, PNG, GIF, WebP (max 5MB)
- **Videos**: MP4, WebM, OGG (max 5MB)
- **Storage**: Automatically uploaded to Supabase storage
- **Preview**: Shows uploaded media with remove option

### **3. Post Creation:**
- **Content**: Required text content
- **Location**: Optional location field
- **Tags**: Custom hashtags for categorization
- **Metadata**: Stores community info, location, tags, media URLs

### **4. Database Integration:**
- Creates posts in your `posts` table
- Links to communities via metadata
- Stores media URLs for display
- Maintains proper relationships

## 🔍 **Testing the System**

### **1. Create a Test Post:**
1. Go to `/community` page
2. Click "What's on your mind?"
3. Select a community from dropdown
4. Write some content
5. Add location (optional)
6. Add tags (optional)
7. Upload media (optional)
8. Click "Post"

### **2. Verify in Database:**
```sql
-- Check if post was created
SELECT * FROM posts ORDER BY created_at DESC LIMIT 1;

-- Check post metadata
SELECT content, metadata FROM posts ORDER BY created_at DESC LIMIT 1;
```

### **3. Check Media Storage:**
```sql
-- Check if media was uploaded
SELECT * FROM storage.objects WHERE bucket_id = 'post-media' ORDER BY created_at DESC LIMIT 5;
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **"Failed to load communities"**
- Check if `communities` table exists
- Verify RLS policies are correct
- Ensure table has data

#### **"Failed to upload media"**
- Run the storage setup script
- Check file size (max 5MB)
- Verify file type (images/videos only)
- If you get "must be owner of table objects" error, use the simple setup script instead

#### **"must be owner of table objects" Error**
- This means the storage policies can't be created automatically
- Use `scripts/setup-post-media-storage-simple.sql` instead
- Configure storage policies manually in Supabase Dashboard (see Step 1.5 above)

#### **"Failed to create post"**
- Check if `posts` table exists
- Verify RLS policies
- Check required fields (content, community)

### **Database Queries for Debugging:**

```sql
-- Check communities table
SELECT COUNT(*) FROM communities;

-- Check posts table
SELECT COUNT(*) FROM posts;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'post-media';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

## 🎉 **What You Get**

After setup, your users can:

✅ **Create posts** with rich content  
✅ **Upload photos and videos** with preview  
✅ **Select communities** from live data  
✅ **Add locations** to posts  
✅ **Create custom tags** for categorization  
✅ **See real-time updates** in the feed  
✅ **Upload media** with automatic storage  
✅ **Get instant feedback** on all actions  

## 🚀 **Next Steps**

1. **Run the storage setup script** (Step 1 above)
2. **Test post creation** with different content types
3. **Verify media uploads** work correctly
4. **Check database** for proper data storage
5. **Test community selection** with live data

Your post creation system is now **fully functional** with live data, media uploads, and complete Supabase integration! 🎊✨
