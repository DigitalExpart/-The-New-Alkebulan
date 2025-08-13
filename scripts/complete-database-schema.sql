-- Complete Updated Database Schema for Diaspora Market Hub
-- This includes all the new fields from the enhanced signup form
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (be careful with this in production!)
-- DROP TABLE IF EXISTS public.event_attendees CASCADE;
-- DROP TABLE IF EXISTS public.messages CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.user_connections CASCADE;
-- DROP TABLE IF EXISTS public.marketplace_items CASCADE;
-- DROP TABLE IF EXISTS public.events CASCADE;
-- DROP TABLE IF EXISTS public.projects CASCADE;
-- DROP TABLE IF EXISTS public.posts CASCADE;
-- DROP TABLE IF EXISTS public.community_members CASCADE;
-- DROP TABLE IF EXISTS public.communities CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('member', 'admin', 'moderator');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE event_type AS ENUM ('meetup', 'workshop', 'conference', 'webinar');
CREATE TYPE account_type AS ENUM ('buyer', 'seller');

-- Users Profile Table (extends Supabase auth.users) - UPDATED with new fields
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_id UUID NOT NULL,
    full_name TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    country TEXT NOT NULL,
    account_type account_type NOT NULL DEFAULT 'buyer',
    buyer_enabled BOOLEAN DEFAULT FALSE,
    seller_enabled BOOLEAN DEFAULT FALSE,
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

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX idx_profiles_country ON public.profiles(country);
CREATE INDEX idx_profiles_buyer_enabled ON public.profiles(buyer_enabled);
CREATE INDEX idx_profiles_seller_enabled ON public.profiles(seller_enabled);

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
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Marketplace Items Table - UPDATED for buyer/seller system
CREATE TABLE public.marketplace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    category TEXT,
    tags TEXT[],
    images TEXT[],
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'available', -- available, sold, reserved, etc.
    quantity INTEGER DEFAULT 1,
    condition TEXT DEFAULT 'new',
    location TEXT,
    shipping_info TEXT,
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
    type TEXT, -- system, community, marketplace, etc.
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID, -- ID of related item (post, event, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Connections Table
CREATE TABLE public.user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, connected_user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_communities_country ON public.communities(country);
CREATE INDEX idx_communities_slug ON public.communities(slug);
CREATE INDEX idx_posts_community_id ON public.posts(community_id);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_events_community_id ON public.events(community_id);
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_marketplace_items_seller_id ON public.marketplace_items(seller_id);
CREATE INDEX idx_marketplace_items_buyer_id ON public.marketplace_items(buyer_id);
CREATE INDEX idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_user_connections_user_id ON public.user_connections(user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_items_updated_at
    BEFORE UPDATE ON public.marketplace_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at
    BEFORE UPDATE ON public.user_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        user_id,
        full_name,
        first_name,
        last_name,
        username,
        email,
        country,
        account_type,
        buyer_enabled,
        seller_enabled,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer'),
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer') = 'buyer' THEN TRUE ELSE FALSE END,
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer') = 'seller' THEN TRUE ELSE FALSE END,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
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

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Public can view basic profile info" ON public.profiles
    FOR SELECT USING (TRUE);

-- RLS Policies for communities table
CREATE POLICY "Communities are viewable by everyone" ON public.communities
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can create communities" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own communities" ON public.communities
    FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for posts table
CREATE POLICY "Posts are viewable by everyone" ON public.posts
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for marketplace items
CREATE POLICY "Marketplace items are viewable by everyone" ON public.marketplace_items
    FOR SELECT USING (TRUE);

CREATE POLICY "Sellers can create marketplace items" ON public.marketplace_items
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own marketplace items" ON public.marketplace_items
    FOR UPDATE USING (auth.uid() = seller_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Verify the table structure
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'communities', 'marketplace_items')
ORDER BY table_name, ordinal_position;

