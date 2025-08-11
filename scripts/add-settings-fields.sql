-- Add Settings Fields to Profiles Table
-- This script adds new columns for user settings, notifications, and privacy preferences

-- Add new columns for settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sso_integrations JSONB DEFAULT '{"google": false, "facebook": false, "apple": false}'::jsonb,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"emailNotifications": true, "pushNotifications": true, "marketingEmails": false, "securityAlerts": true, "communityUpdates": true, "businessOpportunities": false}'::jsonb,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profileVisibility": "public", "showOnlineStatus": true, "showLastSeen": true, "allowFriendRequests": true, "allowMessages": true, "showEmail": false, "showPhone": false}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled ON public.profiles(two_factor_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_notification_settings ON public.profiles USING GIN(notification_settings);
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_settings ON public.profiles USING GIN(privacy_settings);
CREATE INDEX IF NOT EXISTS idx_profiles_sso_integrations ON public.profiles USING GIN(sso_integrations);

-- Add constraints for data validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_two_factor_enabled CHECK (two_factor_enabled IN (TRUE, FALSE));

-- Create function to validate notification settings JSON structure
CREATE OR REPLACE FUNCTION validate_notification_settings_json(settings JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if all required fields exist
  IF NOT (settings ? 'emailNotifications' AND 
          settings ? 'pushNotifications' AND 
          settings ? 'marketingEmails' AND 
          settings ? 'securityAlerts' AND 
          settings ? 'communityUpdates' AND 
          settings ? 'businessOpportunities') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if all values are boolean
  IF NOT (jsonb_typeof(settings->'emailNotifications') = 'boolean' AND
          jsonb_typeof(settings->'pushNotifications') = 'boolean' AND
          jsonb_typeof(settings->'marketingEmails') = 'boolean' AND
          jsonb_typeof(settings->'securityAlerts') = 'boolean' AND
          jsonb_typeof(settings->'communityUpdates') = 'boolean' AND
          jsonb_typeof(settings->'businessOpportunities') = 'boolean') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate privacy settings JSON structure
CREATE OR REPLACE FUNCTION validate_privacy_settings_json(settings JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if all required fields exist
  IF NOT (settings ? 'profileVisibility' AND 
          settings ? 'showOnlineStatus' AND 
          settings ? 'showLastSeen' AND 
          settings ? 'allowFriendRequests' AND 
          settings ? 'allowMessages' AND 
          settings ? 'showEmail' AND 
          settings ? 'showPhone') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if profileVisibility has valid value
  IF NOT (settings->>'profileVisibility' IN ('public', 'friends', 'private')) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if boolean fields are actually boolean
  IF NOT (jsonb_typeof(settings->'showOnlineStatus') = 'boolean' AND
          jsonb_typeof(settings->'showLastSeen') = 'boolean' AND
          jsonb_typeof(settings->'allowFriendRequests') = 'boolean' AND
          jsonb_typeof(settings->'allowMessages') = 'boolean' AND
          jsonb_typeof(settings->'showEmail') = 'boolean' AND
          jsonb_typeof(settings->'showPhone') = 'boolean') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate SSO integrations JSON structure
CREATE OR REPLACE FUNCTION validate_sso_integrations_json(integrations JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if all required fields exist
  IF NOT (integrations ? 'google' AND 
          integrations ? 'facebook' AND 
          integrations ? 'apple') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if all values are boolean
  IF NOT (jsonb_typeof(integrations->'google') = 'boolean' AND
          jsonb_typeof(integrations->'facebook') = 'boolean' AND
          jsonb_typeof(integrations->'apple') = 'boolean') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraints using the validation functions
ALTER TABLE public.profiles 
ADD CONSTRAINT check_notification_settings CHECK (validate_notification_settings_json(notification_settings)),
ADD CONSTRAINT check_privacy_settings CHECK (validate_privacy_settings_json(privacy_settings)),
ADD CONSTRAINT check_sso_integrations CHECK (validate_sso_integrations_json(sso_integrations));

-- Create a function to update settings
CREATE OR REPLACE FUNCTION update_user_settings(
  user_id_param UUID,
  settings_type TEXT,
  settings_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE settings_type
    WHEN 'notification_settings' THEN
      UPDATE public.profiles 
      SET notification_settings = settings_data, updated_at = NOW()
      WHERE user_id = user_id_param;
    WHEN 'privacy_settings' THEN
      UPDATE public.profiles 
      SET privacy_settings = settings_data, updated_at = NOW()
      WHERE user_id = user_id_param;
    WHEN 'sso_integrations' THEN
      UPDATE public.profiles 
      SET sso_integrations = settings_data, updated_at = NOW()
      WHERE user_id = user_id_param;
    WHEN 'two_factor_enabled' THEN
      UPDATE public.profiles 
      SET two_factor_enabled = (settings_data->>'enabled')::boolean, updated_at = NOW()
      WHERE user_id = user_id_param;
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_user_settings(UUID, TEXT, JSONB) TO authenticated;

-- Update existing profiles with default settings
UPDATE public.profiles 
SET 
  two_factor_enabled = FALSE,
  sso_integrations = '{"google": false, "facebook": false, "apple": false}'::jsonb,
  notification_settings = '{"emailNotifications": true, "pushNotifications": true, "marketingEmails": false, "securityAlerts": true, "communityUpdates": true, "businessOpportunities": false}'::jsonb,
  privacy_settings = '{"profileVisibility": "public", "showOnlineStatus": true, "showLastSeen": true, "allowFriendRequests": true, "allowMessages": true, "showEmail": false, "showPhone": false}'::jsonb
WHERE 
  two_factor_enabled IS NULL 
  OR sso_integrations IS NULL 
  OR notification_settings IS NULL 
  OR privacy_settings IS NULL;

-- Create a view for public profile information (respecting privacy settings)
CREATE OR REPLACE VIEW public_profile_view AS
SELECT 
  id,
  user_id,
  full_name,
  username,
  bio,
  location,
  website,
  occupation,
  education,
  avatar_url,
  created_at,
  -- Only show fields based on privacy settings
  CASE 
    WHEN privacy_settings->>'showEmail' = 'true' THEN email 
    ELSE NULL 
  END as email,
  CASE 
    WHEN privacy_settings->>'showPhone' = 'true' THEN phone 
    ELSE NULL 
  END as phone,
  -- Profile visibility check
  CASE 
    WHEN privacy_settings->>'profileVisibility' = 'public' THEN true
    WHEN privacy_settings->>'profileVisibility' = 'friends' THEN false -- Would need friend logic
    WHEN privacy_settings->>'profileVisibility' = 'private' THEN false
    ELSE true
  END as is_visible
FROM public.profiles
WHERE is_public = true;

-- Grant permissions on the view
GRANT SELECT ON public_profile_view TO authenticated;

-- Add RLS policies for the new fields
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to update their own settings
CREATE POLICY "Users can update their own settings" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to view their own settings
CREATE POLICY "Users can view their own settings" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Show summary of changes
SELECT 
  'Settings fields added successfully' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN two_factor_enabled IS NOT NULL THEN 1 END) as profiles_with_2fa,
  COUNT(CASE WHEN notification_settings IS NOT NULL THEN 1 END) as profiles_with_notifications,
  COUNT(CASE WHEN privacy_settings IS NOT NULL THEN 1 END) as profiles_with_privacy,
  COUNT(CASE WHEN sso_integrations IS NOT NULL THEN 1 END) as profiles_with_sso
FROM public.profiles;
