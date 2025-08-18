-- Fix role switching issue - ensure buyer_enabled is always true
-- and that account_type changes don't affect role enabled status

-- Step 1: Ensure buyer_enabled is always true for all users
UPDATE public.profiles 
SET buyer_enabled = true 
WHERE buyer_enabled = false OR buyer_enabled IS NULL;

-- Step 2: Ensure business_enabled is preserved for users who have it enabled
-- (Don't change business_enabled based on account_type)

-- Step 3: Update the handle_new_user function to always set buyer_enabled = true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    username, 
    avatar_url, 
    is_public, 
    created_at, 
    updated_at, 
    buyer_enabled,
    business_enabled,
    creator_enabled, 
    investor_enabled, 
    mentor_enabled
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', SPLIT_PART(COALESCE(new.raw_user_meta_data->>'full_name', new.email), ' ', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', CASE 
      WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL AND new.raw_user_meta_data->>'full_name' != '' THEN
        SUBSTRING(new.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN new.raw_user_meta_data->>'full_name') + 1)
      ELSE ''
    END),
    COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    true,
    NOW(),
    NOW(),
    true,   -- buyer_enabled always true
    false,  -- business_enabled defaults to false
    false,  -- creator_enabled defaults to false
    false,  -- investor_enabled defaults to false
    false   -- mentor_enabled defaults to false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Verify the fix
SELECT 
    'Role switching fix applied successfully!' as message,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN buyer_enabled = true THEN 1 END) as buyer_enabled_count,
    COUNT(CASE WHEN business_enabled = true THEN 1 END) as business_enabled_count
FROM public.profiles;
