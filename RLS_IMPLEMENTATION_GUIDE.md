# 🔒 Row-Level Security (RLS) Implementation Guide

## 📋 **Overview**

Row-Level Security (RLS) is a security feature that controls access to rows in database tables based on the characteristics of the user executing a query. This guide will help you implement RLS for your Supabase database to ensure data security and proper access control.

## 🎯 **What RLS Does**

- **Protects Data**: Users can only access data they're authorized to see
- **Enforces Business Rules**: Ensures users can only perform actions they're allowed to
- **Prevents Data Leaks**: Stops unauthorized access to sensitive information
- **Maintains Privacy**: Keeps user data private and secure

## 🚀 **Quick Setup**

### **Step 1: Run the RLS Script**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `scripts/rls-policies.sql`**
4. **Click "Run" to execute the script**

### **Step 2: Verify RLS is Enabled**

After running the script, you should see:
- ✅ RLS enabled on all tables
- ✅ Policies created for each table
- ✅ Functions and triggers set up
- ✅ Proper permissions granted

## 📊 **RLS Policies by Table**

### **🔐 Profiles Table**
- Users can only view/edit their own profile
- Public profiles are viewable by everyone
- Automatic profile creation on signup

### **🏘️ Communities Table**
- Public communities are viewable by everyone
- Community creators can manage their communities
- Community admins/moderators have full access

### **📝 Posts Table**
- Users can only see posts in communities they're members of
- Users can create/edit/delete their own posts
- Community admins can moderate all posts

### **💼 Projects Table**
- Public projects are viewable by everyone
- Project creators have full access
- Project members can view and update projects

### **📅 Events Table**
- Public events are viewable by everyone
- Event creators can manage their events
- Event attendees can view events they're attending

### **🛒 Marketplace Items Table**
- All users can view active marketplace items
- Users can only manage their own items
- Items are filtered by active status

### **💬 Messages Table**
- Users can only see messages they sent or received
- Private messaging is completely secure
- No cross-user message access

### **🔔 Notifications Table**
- Users can only see their own notifications
- System can create notifications for users
- Users can mark notifications as read

### **🤝 User Connections Table**
- Users can only see their own connections
- Secure friend/connection management
- Private connection data

## 🔧 **Key Functions**

### **1. Automatic Profile Creation**
```sql
-- Automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **2. Notification System**
```sql
-- Creates notifications for users
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, message, related_id, created_at
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_related_id, now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🛡️ **Security Features**

### **Authentication-Based Access**
- All policies use `auth.uid()` to identify the current user
- Unauthenticated users have limited access
- Authenticated users get appropriate permissions

### **Role-Based Access Control**
- **Community Admins**: Full access to their communities
- **Community Moderators**: Can moderate content
- **Project Creators**: Full access to their projects
- **Regular Users**: Access to their own data and public content

### **Data Isolation**
- Users can only access their own data
- Community data is isolated to members
- Private messages are completely secure
- Notifications are user-specific

## 🧪 **Testing RLS**

### **Test as Different Users**

1. **Create multiple test accounts**
2. **Test data access with each account**
3. **Verify users can only see authorized data**
4. **Test admin/moderator permissions**

### **Common Test Scenarios**

```sql
-- Test user can only see their own profile
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Test user can only see community posts they're members of
SELECT * FROM posts WHERE community_id IN (
  SELECT community_id FROM community_members WHERE user_id = auth.uid()
);

-- Test user can only see their own messages
SELECT * FROM messages WHERE sender_id = auth.uid() OR recipient_id = auth.uid();
```

## 🔍 **Monitoring RLS**

### **Check RLS Status**
```sql
-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### **View Active Policies**
```sql
-- View all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Permission denied" errors**
   - Check if RLS is enabled on the table
   - Verify the user has appropriate policies
   - Ensure the user is authenticated

2. **Data not showing up**
   - Check if the user meets the policy conditions
   - Verify the data exists and matches policy criteria
   - Test with a simple SELECT query

3. **Insert/Update failures**
   - Check INSERT/UPDATE policies
   - Verify the user has permission to modify the data
   - Ensure all required fields are provided

### **Debugging Tips**

```sql
-- Check current user ID
SELECT auth.uid();

-- Check if user is authenticated
SELECT auth.role();

-- Test a specific policy
SELECT * FROM profiles WHERE auth.uid() = user_id;
```

## 📈 **Performance Considerations**

### **Policy Optimization**
- Keep policies simple and efficient
- Use indexes on columns used in policies
- Avoid complex subqueries in policies
- Test performance with large datasets

### **Indexing Strategy**
```sql
-- Create indexes for policy performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_messages_sender_recipient ON messages(sender_id, recipient_id);
```

## 🔄 **Maintenance**

### **Regular Checks**
- Monitor policy performance
- Review access patterns
- Update policies as needed
- Test after schema changes

### **Policy Updates**
- Always test policies before deploying
- Use transactions for policy changes
- Document policy changes
- Monitor for any issues

## ✅ **Verification Checklist**

- [ ] RLS enabled on all tables
- [ ] Policies created for each table
- [ ] Functions and triggers working
- [ ] Permissions granted correctly
- [ ] Tested with multiple users
- [ ] Admin/moderator roles working
- [ ] Private data properly secured
- [ ] Performance acceptable
- [ ] Documentation updated

## 🎉 **Benefits Achieved**

✅ **Data Security**: Users can only access authorized data  
✅ **Privacy Protection**: Personal information is secure  
✅ **Access Control**: Proper role-based permissions  
✅ **Audit Trail**: All access is logged and controlled  
✅ **Scalability**: Policies work with any number of users  
✅ **Compliance**: Meets security best practices  

---

**Your database is now secure with comprehensive Row-Level Security!** 🔒 