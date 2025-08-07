-- Seed data for The New Alkebulan platform

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, phone, bio, location, verification_status) VALUES
('amara.johnson@email.com', '$2b$10$example_hash_1', 'Amara', 'Johnson', '+1-555-0101', 'Entrepreneur and community builder passionate about connecting the diaspora.', 'Atlanta, GA', 'verified'),
('kwame.asante@email.com', '$2b$10$example_hash_2', 'Kwame', 'Asante', '+1-555-0102', 'Software developer and tech enthusiast from Ghana, now in the US.', 'San Francisco, CA', 'verified'),
('zara.okafor@email.com', '$2b$10$example_hash_3', 'Zara', 'Okafor', '+1-555-0103', 'Artist and cultural preservationist sharing African heritage through art.', 'New York, NY', 'verified'),
('malik.hassan@email.com', '$2b$10$example_hash_4', 'Malik', 'Hassan', '+1-555-0104', 'Business consultant helping diaspora entrepreneurs scale their ventures.', 'Chicago, IL', 'verified'),
('nia.williams@email.com', '$2b$10$example_hash_5', 'Nia', 'Williams', '+1-555-0105', 'Health and wellness coach promoting holistic living in the community.', 'Los Angeles, CA', 'verified');

-- Insert sample communities
INSERT INTO communities (name, description, category, member_count, created_by) VALUES
('Tech Innovators', 'A community for African diaspora tech professionals and entrepreneurs', 'Technology', 1250, 2),
('Cultural Heritage', 'Preserving and sharing our rich African cultural traditions', 'Culture', 890, 3),
('Business Network', 'Connecting diaspora business owners and investors', 'Business', 2100, 4),
('Wellness Circle', 'Supporting mental, physical, and spiritual health in our community', 'Health', 750, 5),
('Creative Arts', 'Platform for artists, musicians, writers, and creative professionals', 'Arts', 650, 1);

-- Insert community memberships
INSERT INTO community_memberships (user_id, community_id, role) VALUES
(1, 1, 'member'), (1, 3, 'admin'), (1, 5, 'moderator'),
(2, 1, 'admin'), (2, 3, 'member'),
(3, 2, 'admin'), (3, 5, 'member'),
(4, 3, 'admin'), (4, 1, 'member'),
(5, 4, 'admin'), (5, 2, 'member');

-- Insert sample posts
INSERT INTO posts (user_id, community_id, content, post_type, likes_count, comments_count) VALUES
(2, 1, 'Just launched my new fintech app focused on diaspora remittances! Would love feedback from the community. 🚀', 'text', 45, 12),
(3, 2, 'Sharing some beautiful Adinkra symbols I''ve been incorporating into my latest art series. Each symbol tells a story of our ancestors.', 'image', 78, 23),
(4, 3, 'Looking for co-investors for a sustainable agriculture project in Ghana. DM me for details!', 'text', 34, 8),
(5, 4, 'Reminder: Self-care isn''t selfish. Take time for your mental health today. Here are 5 quick mindfulness exercises...', 'text', 92, 15),
(1, 5, 'Excited to announce my upcoming exhibition "Diaspora Dreams" opening next month in Atlanta!', 'text', 56, 18);

-- Insert sample products
INSERT INTO products (seller_id, title, description, price, category, subcategory, condition, location, tags) VALUES
(3, 'Handcrafted Kente Cloth Scarf', 'Authentic Ghanaian Kente cloth scarf, handwoven by master craftsmen. Perfect for special occasions or everyday elegance.', 89.99, 'Fashion', 'Accessories', 'New', 'New York, NY', ARRAY['kente', 'handmade', 'ghana', 'scarf']),
(1, 'African Cookbook Collection', 'Set of 3 cookbooks featuring traditional recipes from across Africa, adapted for modern kitchens.', 45.00, 'Books', 'Cookbooks', 'New', 'Atlanta, GA', ARRAY['cookbook', 'african', 'recipes', 'culture']),
(4, 'Business Consulting Package', 'Complete business development package for diaspora entrepreneurs. Includes market analysis and growth strategy.', 299.99, 'Services', 'Consulting', 'New', 'Chicago, IL', ARRAY['business', 'consulting', 'strategy', 'entrepreneur']),
(5, 'Wellness Retreat Weekend', 'Two-day wellness retreat focusing on holistic health practices rooted in African traditions.', 199.99, 'Services', 'Health', 'New', 'Los Angeles, CA', ARRAY['wellness', 'retreat', 'health', 'holistic']),
(2, 'Mobile App Development', 'Custom mobile app development services with focus on diaspora community needs.', 2500.00, 'Services', 'Technology', 'New', 'San Francisco, CA', ARRAY['app', 'development', 'mobile', 'tech']);

-- Insert sample projects
INSERT INTO projects (creator_id, title, description, category, funding_goal, current_funding, deadline) VALUES
(1, 'Diaspora Cultural Center', 'Building a community center to celebrate and preserve African diaspora culture in Atlanta.', 'Community', 150000.00, 45000.00, '2024-12-31'),
(2, 'EdTech for African Languages', 'Developing an app to teach African languages to diaspora children and adults.', 'Technology', 75000.00, 23000.00, '2024-10-15'),
(4, 'Sustainable Farming Initiative', 'Supporting small-scale farmers in Ghana with modern sustainable farming techniques.', 'Agriculture', 100000.00, 67000.00, '2024-11-30'),
(5, 'Mental Health Support Network', 'Creating a network of culturally competent mental health professionals for the diaspora community.', 'Health', 50000.00, 18000.00, '2024-09-30');

-- Insert sample learning content
INSERT INTO learning_content (title, description, content_type, category, difficulty_level, duration_minutes, author_id, views_count, rating) VALUES
('Introduction to African History', 'Comprehensive overview of African civilizations and their global impact.', 'course', 'History', 'Beginner', 180, 3, 1250, 4.8),
('Building Your First Business', 'Step-by-step guide to starting a business in the diaspora community.', 'course', 'Business', 'Intermediate', 240, 4, 890, 4.6),
('Coding for Beginners', 'Learn programming fundamentals with examples relevant to African diaspora.', 'course', 'Technology', 'Beginner', 300, 2, 2100, 4.7),
('Traditional African Cooking', 'Master the art of preparing authentic African dishes.', 'video', 'Culture', 'Beginner', 45, 1, 750, 4.9),
('Mindfulness and Meditation', 'Ancient African meditation practices for modern stress relief.', 'course', 'Wellness', 'Beginner', 90, 5, 650, 4.5);

-- Insert sample events
INSERT INTO events (organizer_id, title, description, event_type, start_date, end_date, location, max_attendees, current_attendees, price) VALUES
(1, 'Diaspora Business Summit 2024', 'Annual summit bringing together diaspora entrepreneurs and investors.', 'Conference', '2024-09-15 09:00:00', '2024-09-15 17:00:00', 'Atlanta Convention Center', 500, 234, 75.00),
(3, 'African Art Exhibition Opening', 'Grand opening of contemporary African art exhibition.', 'Cultural', '2024-08-20 18:00:00', '2024-08-20 21:00:00', 'Brooklyn Museum', 200, 156, 0.00),
(2, 'Tech Meetup: AI in Africa', 'Discussion on artificial intelligence applications in African development.', 'Networking', '2024-08-25 19:00:00', '2024-08-25 21:00:00', 'San Francisco Tech Hub', 100, 67, 0.00),
(5, 'Wellness Workshop Series', 'Monthly workshop on holistic health practices.', 'Workshop', '2024-09-01 10:00:00', '2024-09-01 15:00:00', 'LA Community Center', 50, 32, 25.00);

-- Insert sample user tokens
INSERT INTO user_tokens (user_id, token_type, amount, source, description) VALUES
(1, 'community_points', 500, 'post_engagement', 'Points earned from community posts and interactions'),
(2, 'learning_credits', 250, 'course_completion', 'Credits earned from completing learning modules'),
(3, 'creator_tokens', 750, 'content_creation', 'Tokens earned from creating valuable community content'),
(4, 'business_credits', 300, 'mentorship', 'Credits earned from providing business mentorship'),
(5, 'wellness_points', 400, 'workshop_hosting', 'Points earned from hosting wellness workshops');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'New Project Backer', 'Someone just backed your Diaspora Cultural Center project!', 'funding', false),
(2, 'Course Completion', 'Congratulations! You completed the African History course.', 'learning', false),
(3, 'Event Reminder', 'Your art exhibition opens tomorrow. Good luck!', 'event', false),
(4, 'New Mentorship Request', 'A community member requested your mentorship for their startup.', 'mentorship', false),
(5, 'Community Milestone', 'The Wellness Circle community just reached 750 members!', 'community', true);
