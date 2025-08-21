# 🔗 Setting Up Friendships Table

## 🚨 **Why This is Needed**

The user profile page now includes friend functionality (Add Friend, Message buttons), but it requires a `friendships` table in your Supabase database to work properly.

## 🛠️ **How to Set Up**

### **Step 1: Access Your Supabase Dashboard**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `tywtrkzlcwqdykyndzvl`

### **Step 2: Run the Friendships Setup Script**
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to create a new SQL script
3. Copy the entire content from `scripts/create-friendships-table.sql`
4. Paste it into the SQL Editor
5. Click **"Run"** to execute the script

### **Step 3: Verify the Setup**
After running the script, you should see:
- **"Friendships table created successfully!"** message
- A new `friendships` table in your database
- Proper Row Level Security (RLS) policies
- Indexes for performance

## 🎯 **What This Enables**

### **User Profile Features:**
- ✅ **Add Friend** button on user profiles
- ✅ **Friend status tracking** (pending, accepted, rejected, blocked)
- ✅ **Message button** for direct communication
- ✅ **Friendship management** system

### **Database Structure:**
- **User relationships** with status tracking
- **Automatic timestamps** for created_at and updated_at
- **Security policies** ensuring users can only see their own friendships
- **Performance indexes** for fast queries

## 🔒 **Security Features**

- **Row Level Security (RLS)** enabled by default
- **Users can only view** friendships they're part of
- **Users can only create** friendship requests from their own account
- **Proper foreign key constraints** to auth.users table

## 🚀 **Next Steps**

After setting up the friendships table:

1. **Refresh your browser** at `http://localhost:3002`
2. **Navigate to any community members page**
3. **Click "View Profile"** on a user card
4. **Test the "Add Friend" and "Message" buttons**

The user profile page should now work without the 404 error, and you'll be able to:
- View other users' profiles
- Add them as friends
- Send them messages
- See their community activity

## 🆘 **Troubleshooting**

If you encounter any issues:

1. **Check the SQL Editor** for any error messages
2. **Verify the table exists** in the Table Editor
3. **Check RLS policies** are properly applied
4. **Ensure you're signed in** to test the functionality

---

**Note:** The friendships table is completely separate from your existing messaging system and won't interfere with any current functionality.
