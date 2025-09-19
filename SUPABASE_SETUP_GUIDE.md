# Supabase Setup Guide

## The Issue
You're getting a "TypeError: Failed to fetch" error because Supabase environment variables are not configured.

## Solution Steps

### 1. Create Environment File
Create a file named `.env.local` in your project root with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Get Your Supabase Credentials

#### Option A: If you already have a Supabase project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key
5. Replace the placeholder values in `.env.local`

#### Option B: If you need to create a new Supabase project
1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click **New Project**
3. Choose your organization
4. Enter project name: `diaspora-market-hub`
5. Enter a strong database password
6. Choose a region close to you
7. Click **Create new project**
8. Wait for the project to be ready (2-3 minutes)
9. Go to **Settings** → **API**
10. Copy the **Project URL** and **anon public** key
11. Replace the placeholder values in `.env.local`

### 3. Example Configuration
Your `.env.local` should look like this:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example_signature_here
```

### 4. Restart Development Server
After creating `.env.local`:
```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
# or
pnpm dev
```

### 5. Verify Configuration
Check your browser console - you should see Supabase configuration logs instead of errors.

## Database Setup
Once Supabase is connected, you'll need to run the database migration scripts. The main ones are:

1. `scripts/social-feed-schema-fixed.sql` - Core social features
2. `scripts/create-user-social-features-schema.sql` - User social features
3. `scripts/create-user-media-table.sql` - Media storage
4. `scripts/create-product-variants-schema.sql` - Product variants
5. `scripts/create-admin-system-tables.sql` - Admin features

## Troubleshooting

### Still getting errors?
1. **Check file location**: `.env.local` must be in the project root (same level as `package.json`)
2. **Check file name**: Must be exactly `.env.local` (not `.env.local.txt`)
3. **Restart server**: Always restart after changing environment variables
4. **Check credentials**: Make sure you copied the correct URL and key from Supabase

### Network Issues
If you're still getting "Failed to fetch" errors:
1. Check your internet connection
2. Try accessing [supabase.com](https://supabase.com) in your browser
3. Check if your firewall/antivirus is blocking the connection

## Next Steps
After Supabase is configured:
1. Run the database migration scripts
2. Test user registration/login
3. Test the social feed functionality
4. Test the marketplace features

Let me know once you've set up the environment variables and I'll help you with the next steps!
