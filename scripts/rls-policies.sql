-- Row-Level Security (RLS) Policies for The New Alkebulan
-- This file sets up security policies for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public profiles can be read by anyone (for community features)
CREATE POLICY "Public profiles are viewable" ON profiles
    FOR SELECT USING (is_public = true);

-- =============================================
-- COMMUNITIES TABLE POLICIES
-- =============================================

-- Anyone can view public communities
CREATE POLICY "Public communities are viewable" ON communities
    FOR SELECT USING (is_public = true);

-- Community creators can manage their communities
CREATE POLICY "Community creators can manage communities" ON communities
    FOR ALL USING (auth.uid() = created_by);

-- Community admins can manage communities
CREATE POLICY "Community admins can manage communities" ON communities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM community_members 
            WHERE community_id = communities.id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- COMMUNITY_MEMBERS TABLE POLICIES
-- =============================================

-- Users can view members of communities they're in
CREATE POLICY "Users can view community members" ON community_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM community_members cm2
            WHERE cm2.community_id = community_members.community_id
            AND cm2.user_id = auth.uid()
        )
    );

-- Users can join communities
CREATE POLICY "Users can join communities" ON community_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave communities
CREATE POLICY "Users can leave communities" ON community_members
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all members
CREATE POLICY "Admins can manage community members" ON community_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM community_members cm2
            WHERE cm2.community_id = community_members.community_id
            AND cm2.user_id = auth.uid()
            AND cm2.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- POSTS TABLE POLICIES
-- =============================================

-- Users can view posts in communities they're members of
CREATE POLICY "Users can view community posts" ON posts
    FOR SELECT USING (
        community_id IS NULL OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = posts.community_id
            AND user_id = auth.uid()
        )
    );

-- Users can create posts
CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- Community admins can moderate posts
CREATE POLICY "Community admins can moderate posts" ON posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = posts.community_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- PROJECTS TABLE POLICIES
-- =============================================

-- Users can view public projects
CREATE POLICY "Public projects are viewable" ON projects
    FOR SELECT USING (is_public = true);

-- Project creators can manage their projects
CREATE POLICY "Project creators can manage projects" ON projects
    FOR ALL USING (auth.uid() = created_by);

-- Project members can view and update projects
CREATE POLICY "Project members can manage projects" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = projects.id
            AND user_id = auth.uid()
        )
    );

-- =============================================
-- PROJECT_MEMBERS TABLE POLICIES
-- =============================================

-- Project members can view other members
CREATE POLICY "Project members can view members" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = project_members.project_id
            AND pm2.user_id = auth.uid()
        )
    );

-- Users can join projects
CREATE POLICY "Users can join projects" ON project_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave projects
CREATE POLICY "Users can leave projects" ON project_members
    FOR DELETE USING (auth.uid() = user_id);

-- Project creators can manage members
CREATE POLICY "Project creators can manage members" ON project_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_members.project_id
            AND created_by = auth.uid()
        )
    );

-- =============================================
-- EVENTS TABLE POLICIES
-- =============================================

-- Users can view public events
CREATE POLICY "Public events are viewable" ON events
    FOR SELECT USING (is_public = true);

-- Event creators can manage their events
CREATE POLICY "Event creators can manage events" ON events
    FOR ALL USING (auth.uid() = created_by);

-- Event attendees can view events
CREATE POLICY "Event attendees can view events" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM event_attendees
            WHERE event_id = events.id
            AND user_id = auth.uid()
        )
    );

-- =============================================
-- EVENT_ATTENDEES TABLE POLICIES
-- =============================================

-- Users can view attendees of events they're attending
CREATE POLICY "Users can view event attendees" ON event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM event_attendees ea2
            WHERE ea2.event_id = event_attendees.event_id
            AND ea2.user_id = auth.uid()
        )
    );

-- Users can join events
CREATE POLICY "Users can join events" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave events
CREATE POLICY "Users can leave events" ON event_attendees
    FOR DELETE USING (auth.uid() = user_id);

-- Event creators can manage attendees
CREATE POLICY "Event creators can manage attendees" ON event_attendees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE id = event_attendees.event_id
            AND created_by = auth.uid()
        )
    );

-- =============================================
-- MARKETPLACE_ITEMS TABLE POLICIES
-- =============================================

-- Users can view marketplace items
CREATE POLICY "Users can view marketplace items" ON marketplace_items
    FOR SELECT USING (is_active = true);

-- Users can create marketplace items
CREATE POLICY "Users can create marketplace items" ON marketplace_items
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Users can update their own marketplace items
CREATE POLICY "Users can update own marketplace items" ON marketplace_items
    FOR UPDATE USING (auth.uid() = seller_id);

-- Users can delete their own marketplace items
CREATE POLICY "Users can delete own marketplace items" ON marketplace_items
    FOR DELETE USING (auth.uid() = seller_id);

-- =============================================
-- MESSAGES TABLE POLICIES
-- =============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages (for editing)
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid() = sender_id);

-- =============================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- =============================================
-- USER_CONNECTIONS TABLE POLICIES
-- =============================================

-- Users can view their connections
CREATE POLICY "Users can view their connections" ON user_connections
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = connected_user_id
    );

-- Users can create connections
CREATE POLICY "Users can create connections" ON user_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their connections
CREATE POLICY "Users can update their connections" ON user_connections
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their connections
CREATE POLICY "Users can delete their connections" ON user_connections
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION TO HANDLE USER REGISTRATION
-- =============================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- FUNCTION TO HANDLE NOTIFICATIONS
-- =============================================

-- Function to create notifications for various events
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
    user_id, 
    type, 
    title, 
    message, 
    related_id, 
    created_at
  ) VALUES (
    p_user_id, 
    p_type, 
    p_title, 
    p_message, 
    p_related_id, 
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE profiles IS 'User profiles with RLS ensuring users can only access their own data';
COMMENT ON TABLE communities IS 'Communities with RLS ensuring proper access control';
COMMENT ON TABLE posts IS 'Community posts with RLS ensuring members can only access their community posts';
COMMENT ON TABLE projects IS 'User projects with RLS ensuring proper access control';
COMMENT ON TABLE events IS 'Events with RLS ensuring proper access control';
COMMENT ON TABLE marketplace_items IS 'Marketplace items with RLS ensuring proper access control';
COMMENT ON TABLE messages IS 'Private messages with RLS ensuring only sender/recipient can access';
COMMENT ON TABLE notifications IS 'User notifications with RLS ensuring users can only access their own';
COMMENT ON TABLE user_connections IS 'User connections with RLS ensuring proper access control';

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a user signs up';
COMMENT ON FUNCTION public.create_notification() IS 'Creates notifications for users with proper security'; 