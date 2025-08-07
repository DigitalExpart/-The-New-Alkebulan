-- Create database schema for The New Alkebulan platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    date_of_birth DATE,
    verification_status VARCHAR(50) DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    category VARCHAR(100),
    member_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community memberships
CREATE TABLE IF NOT EXISTS community_memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    community_id INTEGER REFERENCES communities(id),
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, community_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    community_id INTEGER REFERENCES communities(id),
    content TEXT NOT NULL,
    image_url TEXT,
    post_type VARCHAR(50) DEFAULT 'text',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    condition VARCHAR(50),
    location VARCHAR(255),
    images TEXT[], -- Array of image URLs
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id),
    seller_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    funding_goal DECIMAL(12, 2),
    current_funding DECIMAL(12, 2) DEFAULT 0,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    investor_id INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    amount DECIMAL(10, 2) NOT NULL,
    investment_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning content table
CREATE TABLE IF NOT EXISTS learning_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50), -- video, article, course, etc.
    category VARCHAR(100),
    difficulty_level VARCHAR(50),
    duration_minutes INTEGER,
    content_url TEXT,
    thumbnail_url TEXT,
    author_id INTEGER REFERENCES users(id),
    views_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content_id INTEGER REFERENCES learning_content(id),
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    organizer_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    is_virtual BOOLEAN DEFAULT FALSE,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    price DECIMAL(8, 2) DEFAULT 0,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_id INTEGER REFERENCES users(id),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status VARCHAR(50) DEFAULT 'registered',
    UNIQUE(event_id, user_id)
);

-- Mentorship relationships
CREATE TABLE IF NOT EXISTS mentorships (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER REFERENCES users(id),
    mentee_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    expertise_area VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User tokens/points system
CREATE TABLE IF NOT EXISTS user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    source VARCHAR(100), -- earned_from, purchased, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- system, social, business, etc.
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
