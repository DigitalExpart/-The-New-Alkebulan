-- Diaspora Market Hub Database Schema
-- Copy and paste this entire script into your Supabase SQL Editor

-- Create custom types
CREATE TYPE user_role AS ENUM ('member', 'admin', 'moderator');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE event_type AS ENUM ('meetup', 'workshop', 'conference', 'webinar');

-- Users Profile Table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    date_of_birth DATE,
    heritage_country TEXT,
    languages TEXT[],
    skills TEXT[],
    interests TEXT[],
    website TEXT,
    linkedin TEXT,
    twitter TEXT,
    instagram TEXT,
    role user_role DEFAULT 'member',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communities Table
CREATE TABLE public.communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    country TEXT,
    region TEXT,
    member_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Members Table
CREATE TABLE public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Posts Table
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    parent_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    status project_status DEFAULT 'draft',
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    tags TEXT[],
    funding_goal DECIMAL(10,2),
    current_funding DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    virtual_meeting_url TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Attendees Table
CREATE TABLE public.event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Marketplace Products/Services Table
CREATE TABLE public.marketplace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    category TEXT,
    tags TEXT[],
    images TEXT[],
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    related_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Connections/Friends Table
CREATE TABLE public.user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(id);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_community ON public.posts(community_id);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_marketplace_seller ON public.marketplace_items(seller_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Communities: Public communities are viewable by everyone
CREATE POLICY "Communities are viewable by everyone" ON public.communities FOR SELECT USING (is_public = true);
CREATE POLICY "Community creators can manage their communities" ON public.communities FOR ALL USING (auth.uid() = created_by);

-- Posts: Public posts are viewable by everyone
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Events: Public events are viewable by everyone
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);

-- Marketplace: Active items are viewable by everyone
CREATE POLICY "Marketplace items are viewable by everyone" ON public.marketplace_items FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create marketplace items" ON public.marketplace_items FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own marketplace items" ON public.marketplace_items FOR UPDATE USING (auth.uid() = seller_id);

-- Messages: Users can only see messages they sent or received
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON public.marketplace_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_connections_updated_at BEFORE UPDATE ON public.user_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 