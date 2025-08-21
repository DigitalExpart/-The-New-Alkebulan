# 🚨 Quick Fix: Missing core_competencies Column

## 🚨 **Current Error**
```
Failed to save profile changes: Could not find the 'core_competencies' column of 'profiles' in the schema cache
```

## 🛠️ **How to Fix (2 minutes)**

### **Step 1: Run the Complete Profiles Script**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `tywtrkzlcwqdykyndzvl`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the entire content from `scripts/create-profiles-table-complete.sql`
6. Paste it into the SQL Editor
7. Click **"Run"**

### **Step 2: Verify Success**
You should see:
- **"Complete profiles table created successfully with ALL fields including core_competencies!"**

## 🎯 **What This Fixes**
- ✅ Adds the missing `core_competencies` column
- ✅ Includes ALL possible profile fields
- ✅ Creates sample data for existing users
- ✅ Sets up proper indexes and security

## 🧪 **Test the Fix**
1. **Refresh your browser**
2. **Try editing your profile again**
3. **The error should be gone**

## 💡 **Why This Happened**
The previous profiles table was missing some fields that the application expected, including `core_competencies`. This complete script includes ALL possible fields to prevent future issues.

---
**Time to fix: ~2 minutes**
**Result: Profile editing will work perfectly**
