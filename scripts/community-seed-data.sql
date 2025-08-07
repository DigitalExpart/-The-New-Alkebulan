-- Additional seed data for community features

-- Insert community moderators
INSERT INTO community_moderators (community_id, user_id, permissions, appointed_by) VALUES
(1, 2, ARRAY['moderate_posts', 'manage_members', 'manage_events'], 2),
(2, 3, ARRAY['moderate_posts', 'manage_members'], 3),
(3, 4, ARRAY['moderate_posts', 'manage_members', 'manage_finances'], 4),
(4, 5, ARRAY['moderate_posts', 'manage_members'], 5),
(5, 1, ARRAY['moderate_posts', 'manage_members'], 1);

-- Insert post reactions
INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES
(1, 2, 'like'), (1, 3, 'love'), (1, 4, 'like'), (1, 5, 'like'),
(2, 1, 'like'), (2, 3, 'like'), (2, 4, 'love'), (2, 5, 'like'),
(3, 1, 'love'), (3, 2, 'like'), (3, 4, 'love'), (3, 5, 'love'),
(4, 1, 'like'), (4, 2, 'like'), (4, 3, 'like'),
(5, 2, 'love'), (5, 3, 'like'), (5, 4, 'like');

-- Insert post tags
INSERT INTO post_tags (post_id, tag) VALUES
(1, 'fintech'), (1, 'startup'), (1, 'diaspora'), (1, 'technology'),
(2, 'ghana'), (2, 'tech'), (2, 'ecosystem'), (2, 'africa'),
(3, 'art'), (3, 'culture'), (3, 'adinkra'), (3, 'heritage'),
(4, 'business'), (4, 'investment'), (4, 'agriculture'), (4, 'sustainability'),
(5, 'wellness'), (5, 'mentalhealth'), (5, 'selfcare'), (5, 'mindfulness');

-- Insert user follows
INSERT INTO user_follows (follower_id, following_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3), (5, 4);

-- Insert community events
INSERT INTO community_events (community_id, title, description, event_date, location, is_virtual, max_attendees, created_by) VALUES
(1, 'Monthly Tech Meetup', 'Networking event for tech professionals in the diaspora community', '2024-09-15 18:00:00', 'San Francisco Tech Hub', false, 100, 2),
(2, 'Cultural Heritage Workshop', 'Learn about traditional African crafts and their modern applications', '2024-09-20 14:00:00', 'Brooklyn Community Center', false, 50, 3),
(3, 'Business Pitch Night', 'Present your business ideas to potential investors and mentors', '2024-09-25 19:00:00', 'Chicago Business District', false, 75, 4),
(4, 'Wellness Meditation Session', 'Guided meditation and wellness practices', '2024-09-18 10:00:00', 'Virtual', true, 200, 5),
(5, 'Art Exhibition Opening', 'Showcase of contemporary African diaspora artists', '2024-10-01 17:00:00', 'Atlanta Art Gallery', false, 150, 1);

-- Update communities with additional data
UPDATE communities SET 
    rules = ARRAY['Be respectful to all members', 'No spam or self-promotion without permission', 'Stay on topic', 'Use appropriate language'],
    tags = ARRAY['technology', 'innovation', 'diaspora', 'networking'],
    color_theme = 'blue',
    is_featured = true
WHERE id = 1;

UPDATE communities SET 
    rules = ARRAY['Respect cultural diversity', 'Share authentic content', 'Credit original sources', 'Engage constructively'],
    tags = ARRAY['culture', 'heritage', 'tradition', 'art'],
    color_theme = 'orange',
    is_featured = true
WHERE id = 2;

UPDATE communities SET 
    rules = ARRAY['Professional conduct required', 'No unsolicited sales pitches', 'Provide value in discussions', 'Respect confidentiality'],
    tags = ARRAY['business', 'entrepreneurship', 'networking', 'investment'],
    color_theme = 'green',
    is_featured = true
WHERE id = 3;

UPDATE communities SET 
    rules = ARRAY['Support each other', 'Share resources freely', 'Respect privacy', 'No medical advice'],
    tags = ARRAY['wellness', 'health', 'mindfulness', 'support'],
    color_theme = 'purple'
WHERE id = 4;

UPDATE communities SET 
    rules = ARRAY['Original content preferred', 'Credit collaborators', 'Constructive feedback only', 'Celebrate creativity'],
    tags = ARRAY['art', 'creativity', 'music', 'writing'],
    color_theme = 'pink'
WHERE id = 5;
