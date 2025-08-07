# Database Setup Guide for Diaspora Market Hub

## 🗄️ **What You'll Find in Your Database**

After running the setup scripts, your Supabase database will contain:

### **📊 Tables Created:**
1. **`profiles`** - User profiles (extends Supabase auth)
2. **`communities`** - Diaspora communities and groups
3. **`community_members`** - Community membership tracking
4. **`posts`** - Community posts and discussions
5. **`projects`** - Community projects and initiatives
6. **`events`** - Community events and meetups
7. **`event_attendees`** - Event registration tracking
8. **`marketplace_items`** - Products and services marketplace
9. **`messages`** - Private messaging between users
10. **`notifications`** - User notifications
11. **`user_connections`** - Friend/connection system

### **🔒 Security Features:**
- **Row Level Security (RLS)** enabled on all tables
- **Policies** that control who can read/write data
- **Automatic profile creation** when users sign up
- **Updated timestamps** for all records
- **JWT authentication** handled by Supabase automatically

## 🚀 **Step-by-Step Setup Instructions**

### **Step 1: Access Your Supabase SQL Editor**

1. **Go to your Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project:** `tywtrkzlcwqdykyndzvl`
3. **Click on "SQL Editor"** in the left sidebar
4. **Click "New Query"** to create a new SQL script

### **Step 2: Run the Database Schema**

1. **Copy the entire content** from `scripts/database-schema.sql`
2. **Paste it into the SQL Editor**
3. **Click "Run"** to execute the script
4. **Wait for completion** (this may take a few minutes)

### **Step 3: Run the Sample Data**

1. **Create another new query** in the SQL Editor
2. **Copy the entire content** from `scripts/sample-data.sql`
3. **Paste it into the SQL Editor**
4. **Click "Run"** to populate with sample data

### **Step 4: Verify the Setup**

1. **Go to "Table Editor"** in the left sidebar
2. **You should see all the tables listed:**
   - `profiles`
   - `communities`
   - `posts`
   - `events`
   - `marketplace_items`
   - `projects`
   - And more...

3. **Click on any table** to see the sample data

## 📋 **What Each Table Contains**

### **`profiles` Table:**
- User information (name, bio, location, skills)
- Heritage and cultural information
- Social media links
- Verification status

### **`communities` Table:**
- Community names and descriptions
- Geographic information (country, region)
- Member counts and privacy settings

### **`posts` Table:**
- Community discussions and announcements
- Like and comment counts
- Author and community relationships

### **`events` Table:**
- Community events and meetups
- Event types (conference, workshop, meetup)
- Location and virtual meeting information
- Attendee limits and current counts

### **`marketplace_items` Table:**
- Products and services for sale
- Pricing and currency information
- Categories and tags
- Stock quantities

### **`projects` Table:**
- Community initiatives and projects
- Funding goals and current amounts
- Project status and timelines

## 🔧 **Testing Your Database**

### **Test Email/Password Authentication:**

1. **First, disable email confirmation:**
   - Go to Authentication → Settings
   - Turn OFF "Enable email confirmations"
   - Save changes

2. **Test signup:**
   - Go to http://localhost:3000/auth/signup
   - Create a new account
   - You should be redirected to the dashboard

3. **Check the database:**
   - Go to Table Editor → `profiles`
   - You should see your new user profile

### **Test the Dashboard:**

1. **After signing up, you should see:**
   - Welcome message with your name
   - Quick action buttons
   - Sample communities and content
   - Profile information

## 🚨 **Important Notes**

### **Security:**
- All tables have Row Level Security enabled
- Users can only access their own data
- Public content (communities, posts, events) is viewable by everyone
- Private data (messages, notifications) is restricted

### **Performance:**
- Indexes are created for better query performance
- Automatic triggers update timestamps
- Efficient relationships between tables

### **Scalability:**
- UUID primary keys for better distribution
- Proper foreign key relationships
- Optimized for growth

## 🔍 **Troubleshooting**

### **If you get errors:**

1. **Check the SQL syntax** - Make sure you copied the entire script
2. **Run scripts in order** - Schema first, then sample data
3. **Check Supabase logs** - Look for any error messages
4. **Verify your project** - Make sure you're in the right project

### **If tables are empty:**

1. **Check RLS policies** - Make sure they allow the right access
2. **Verify user authentication** - Users need to be signed in
3. **Check foreign key relationships** - Make sure IDs match

## 🎯 **Next Steps**

After setting up the database:

1. **Test the authentication flow** with email/password
2. **Explore the dashboard** and see the sample data
3. **Try creating a post** or joining a community
4. **Test the marketplace** functionality
5. **Explore events** and projects

**Your diaspora market hub is now ready with a complete database structure!** 🎉 