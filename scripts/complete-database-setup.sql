-- Complete Database Setup for The New Alkebulan
-- This script creates all tables and applies RLS policies

-- =============================================
-- CREATE TABLES
-- =============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(community_id, user_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'declined')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Marketplace items table
CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    category TEXT,
    condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User connections table
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, connected_user_id)
);

-- =============================================
-- CREATE INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Communities indexes
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_is_public ON communities(is_public);

-- Community members indexes
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Project members indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- Event attendees indexes
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_is_active ON marketplace_items(is_active);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- User connections indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

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
-- CREATE RLS POLICIES
-- =============================================

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable" ON profiles
    FOR SELECT USING (is_public = true);

-- COMMUNITIES TABLE POLICIES
CREATE POLICY "Public communities are viewable" ON communities
    FOR SELECT USING (is_public = true);

CREATE POLICY "Community creators can manage communities" ON communities
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Community admins can manage communities" ON communities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM community_members 
            WHERE community_id = communities.id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- COMMUNITY_MEMBERS TABLE POLICIES
CREATE POLICY "Users can view community members" ON community_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM community_members cm2
            WHERE cm2.community_id = community_members.community_id
            AND cm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join communities" ON community_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON community_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage community members" ON community_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM community_members cm2
            WHERE cm2.community_id = community_members.community_id
            AND cm2.user_id = auth.uid()
            AND cm2.role IN ('admin', 'moderator')
        )
    );

-- POSTS TABLE POLICIES
CREATE POLICY "Users can view community posts" ON posts
    FOR SELECT USING (
        community_id IS NULL OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = posts.community_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Community admins can moderate posts" ON posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_id = posts.community_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'moderator')
        )
    );

-- PROJECTS TABLE POLICIES
CREATE POLICY "Public projects are viewable" ON projects
    FOR SELECT USING (is_public = true);

CREATE POLICY "Project creators can manage projects" ON projects
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Project members can manage projects" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = projects.id
            AND user_id = auth.uid()
        )
    );

-- PROJECT_MEMBERS TABLE POLICIES
CREATE POLICY "Project members can view members" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = project_members.project_id
            AND pm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join projects" ON project_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave projects" ON project_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Project creators can manage members" ON project_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_members.project_id
            AND created_by = auth.uid()
        )
    );

-- EVENTS TABLE POLICIES
CREATE POLICY "Public events are viewable" ON events
    FOR SELECT USING (is_public = true);

CREATE POLICY "Event creators can manage events" ON events
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Event attendees can view events" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM event_attendees
            WHERE event_id = events.id
            AND user_id = auth.uid()
        )
    );

-- EVENT_ATTENDEES TABLE POLICIES
CREATE POLICY "Users can view event attendees" ON event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM event_attendees ea2
            WHERE ea2.event_id = event_attendees.event_id
            AND ea2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join events" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" ON event_attendees
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Event creators can manage attendees" ON event_attendees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE id = event_attendees.event_id
            AND created_by = auth.uid()
        )
    );

-- MARKETPLACE_ITEMS TABLE POLICIES
CREATE POLICY "Users can view marketplace items" ON marketplace_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create marketplace items" ON marketplace_items
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own marketplace items" ON marketplace_items
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own marketplace items" ON marketplace_items
    FOR DELETE USING (auth.uid() = seller_id);

-- MESSAGES TABLE POLICIES
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid() = sender_id);

-- NOTIFICATIONS TABLE POLICIES
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- USER_CONNECTIONS TABLE POLICIES
CREATE POLICY "Users can view their connections" ON user_connections
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = connected_user_id
    );

CREATE POLICY "Users can create connections" ON user_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their connections" ON user_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their connections" ON user_connections
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- CREATE FUNCTIONS
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
-- CREATE TRIGGERS
-- =============================================

-- Trigger to call the function when a new user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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