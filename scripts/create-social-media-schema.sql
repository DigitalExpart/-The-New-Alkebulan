-- Social Media Integration Database Schema
-- This script creates tables for social media connections and imported media

-- Create social media connections table
CREATE TABLE IF NOT EXISTS social_media_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'linkedin')),
  platform_user_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  platform_username VARCHAR(255),
  platform_display_name VARCHAR(255),
  profile_picture_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Create imported media table
CREATE TABLE IF NOT EXISTS imported_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES social_media_connections(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'linkedin')),
  platform_media_id VARCHAR(255) NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  created_at_platform TIMESTAMP WITH TIME ZONE,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  UNIQUE(connection_id, platform_media_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_media_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_media_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_active ON social_media_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_imported_media_user_id ON imported_media(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_media_platform ON imported_media(platform);
CREATE INDEX IF NOT EXISTS idx_imported_media_connection_id ON imported_media(connection_id);
CREATE INDEX IF NOT EXISTS idx_imported_media_post_id ON imported_media(post_id);

-- Enable Row Level Security
ALTER TABLE social_media_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_media_connections
CREATE POLICY "Users can view their own connections" ON social_media_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections" ON social_media_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON social_media_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON social_media_connections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for imported_media
CREATE POLICY "Users can view their own imported media" ON imported_media
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imported media" ON imported_media
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imported media" ON imported_media
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imported media" ON imported_media
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_social_media_connections_updated_at 
  BEFORE UPDATE ON social_media_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user's social media connections
CREATE OR REPLACE FUNCTION get_user_social_connections(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  platform VARCHAR(20),
  platform_username VARCHAR(255),
  platform_display_name VARCHAR(255),
  profile_picture_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    smc.id,
    smc.platform,
    smc.platform_username,
    smc.platform_display_name,
    smc.profile_picture_url,
    smc.is_active,
    smc.created_at,
    smc.updated_at
  FROM social_media_connections smc
  WHERE smc.user_id = user_uuid
    AND smc.is_active = true
  ORDER BY smc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get imported media count by platform
CREATE OR REPLACE FUNCTION get_imported_media_stats(user_uuid UUID)
RETURNS TABLE (
  platform VARCHAR(20),
  total_count BIGINT,
  image_count BIGINT,
  video_count BIGINT,
  last_imported TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.platform,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE im.media_type = 'image') as image_count,
    COUNT(*) FILTER (WHERE im.media_type = 'video') as video_count,
    MAX(im.imported_at) as last_imported
  FROM imported_media im
  WHERE im.user_id = user_uuid
  GROUP BY im.platform
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON social_media_connections TO authenticated;
GRANT ALL ON imported_media TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_social_connections(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_imported_media_stats(UUID) TO authenticated;

-- Insert sample data (optional - remove in production)
-- INSERT INTO social_media_connections (user_id, platform, platform_user_id, access_token, platform_username, platform_display_name)
-- VALUES 
--   ('your-user-id', 'instagram', 'instagram-user-id', 'encrypted-token', 'sample_user', 'Sample User');

-- Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('social_media_connections', 'imported_media')
ORDER BY table_name, ordinal_position;
