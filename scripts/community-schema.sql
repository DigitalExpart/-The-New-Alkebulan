-- Community-specific database schema extensions

-- Extended communities table with additional fields
ALTER TABLE communities ADD COLUMN IF NOT EXISTS rules TEXT[];
ALTER TABLE communities ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE communities ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS color_theme VARCHAR(50) DEFAULT 'default';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Community moderators table
CREATE TABLE IF NOT EXISTS community_moderators (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id),
    user_id INTEGER REFERENCES users(id),
    permissions TEXT[] DEFAULT ARRAY['moderate_posts', 'manage_members'],
    appointed_by INTEGER REFERENCES users(id),
    appointed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, user_id)
);

-- Post reactions table (for different types of reactions beyond likes)
CREATE TABLE IF NOT EXISTS post_reactions (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    user_id INTEGER REFERENCES users(id),
    reaction_type VARCHAR(50) NOT NULL, -- like, love, laugh, angry, sad, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id, reaction_type)
);

-- Post tags table
CREATE TABLE IF NOT EXISTS post_tags (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community events table
CREATE TABLE IF NOT EXISTS community_events (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_virtual BOOLEAN DEFAULT FALSE,
    max_attendees INTEGER,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User follows table (for following other users)
CREATE TABLE IF NOT EXISTS user_follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id),
    following_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

-- Community join requests (for private communities)
CREATE TABLE IF NOT EXISTS community_join_requests (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(id),
    user_id INTEGER REFERENCES users(id),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),
    UNIQUE(community_id, user_id)
);

-- Post reports table
CREATE TABLE IF NOT EXISTS post_reports (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    reported_by INTEGER REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP
);

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_community_events_community ON community_events(community_id);
CREATE INDEX IF NOT EXISTS idx_community_events_date ON community_events(event_date);
