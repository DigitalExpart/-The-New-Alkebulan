-- Sample Data for Diaspora Market Hub
-- Run this after the database schema

-- Insert sample communities
INSERT INTO public.communities (name, description, slug, country, region, member_count, is_public, created_by) VALUES
('Nigerian Diaspora Network', 'Connecting Nigerians around the world for business, culture, and community support.', 'nigerian-diaspora', 'Nigeria', 'West Africa', 1250, true, NULL),
('Ghanaian Entrepreneurs', 'A community for Ghanaian entrepreneurs and business owners to network and collaborate.', 'ghanaian-entrepreneurs', 'Ghana', 'West Africa', 890, true, NULL),
('Kenyan Tech Hub', 'Innovation and technology community for Kenyans in the diaspora.', 'kenyan-tech-hub', 'Kenya', 'East Africa', 567, true, NULL),
('South African Business Network', 'Professional network for South African business leaders and entrepreneurs.', 'sa-business-network', 'South Africa', 'Southern Africa', 432, true, NULL),
('African Women in Tech', 'Empowering African women in technology and innovation.', 'african-women-tech', 'Pan-African', 'Global', 789, true, NULL);

-- Insert sample posts (you'll need to replace author_id with actual user IDs after signup)
INSERT INTO public.posts (title, content, author_id, community_id, likes_count, comments_count) VALUES
('Welcome to Our Community!', 'Hello everyone! I''m excited to be part of this amazing diaspora network. Looking forward to connecting with fellow Nigerians around the world.', NULL, (SELECT id FROM public.communities WHERE slug = 'nigerian-diaspora'), 15, 8),
('Business Opportunities in Tech', 'I''m looking to connect with other tech entrepreneurs. Anyone interested in discussing potential collaborations?', NULL, (SELECT id FROM public.communities WHERE slug = 'ghanaian-entrepreneurs'), 23, 12),
('Cultural Exchange Event', 'Planning a cultural exchange event next month. Would love to hear ideas and get volunteers!', NULL, (SELECT id FROM public.communities WHERE slug = 'kenyan-tech-hub'), 34, 19),
('Mentorship Program Launch', 'We''re launching a mentorship program for young African professionals. Sign up if you''re interested in being a mentor or mentee.', NULL, (SELECT id FROM public.communities WHERE slug = 'african-women-tech'), 45, 25);

-- Insert sample events
INSERT INTO public.events (title, description, event_type, start_date, end_date, location, virtual_meeting_url, max_attendees, organizer_id, community_id) VALUES
('Diaspora Business Summit 2024', 'Join us for our annual business summit featuring speakers, networking, and investment opportunities.', 'conference', '2024-06-15 09:00:00+00', '2024-06-15 17:00:00+00', 'London, UK', 'https://meet.google.com/abc-defg-hij', 200, NULL, (SELECT id FROM public.communities WHERE slug = 'nigerian-diaspora')),
('Tech Innovation Workshop', 'Hands-on workshop on emerging technologies and their applications in African markets.', 'workshop', '2024-05-20 14:00:00+00', '2024-05-20 16:00:00+00', 'Virtual', 'https://zoom.us/j/123456789', 50, NULL, (SELECT id FROM public.communities WHERE slug = 'kenyan-tech-hub')),
('Networking Mixer', 'Casual networking event for entrepreneurs and professionals.', 'meetup', '2024-05-25 18:00:00+00', '2024-05-25 21:00:00+00', 'New York, NY', NULL, 100, NULL, (SELECT id FROM public.communities WHERE slug = 'ghanaian-entrepreneurs')),
('Women in Leadership Panel', 'Panel discussion featuring successful African women leaders sharing their journey and insights.', 'webinar', '2024-06-01 15:00:00+00', '2024-06-01 16:30:00+00', 'Virtual', 'https://teams.microsoft.com/l/meetup-join/abc123', 150, NULL, (SELECT id FROM public.communities WHERE slug = 'african-women-tech'));

-- Insert sample marketplace items
INSERT INTO public.marketplace_items (title, description, price, currency, category, tags, seller_id, stock_quantity) VALUES
('Handmade African Jewelry', 'Beautiful handcrafted jewelry made with traditional African beads and designs.', 45.00, 'USD', 'Fashion', ARRAY['jewelry', 'handmade', 'african', 'traditional'], NULL, 10),
('African Cookbook Collection', 'Digital collection of authentic African recipes from different regions.', 25.00, 'USD', 'Books', ARRAY['cookbook', 'recipes', 'african', 'digital'], NULL, 999),
('Business Consulting Services', 'Professional business consulting for startups and small businesses.', 150.00, 'USD', 'Services', ARRAY['consulting', 'business', 'startup', 'strategy'], NULL, 1),
('Traditional African Art', 'Original paintings and artwork from contemporary African artists.', 300.00, 'USD', 'Art', ARRAY['art', 'painting', 'african', 'contemporary'], NULL, 5),
('Language Learning Course', 'Online course for learning African languages (Yoruba, Swahili, Zulu).', 75.00, 'USD', 'Education', ARRAY['language', 'learning', 'online', 'course'], NULL, 999);

-- Insert sample projects
INSERT INTO public.projects (title, description, status, author_id, community_id, tags, funding_goal, current_funding, start_date, end_date) VALUES
('African Tech Startup Incubator', 'Creating an incubator program to support African tech startups with mentorship, funding, and resources.', 'active', NULL, (SELECT id FROM public.communities WHERE slug = 'kenyan-tech-hub'), ARRAY['tech', 'startup', 'incubator', 'mentorship'], 50000.00, 15000.00, '2024-01-01', '2024-12-31'),
('Community Education Center', 'Building a community center to provide educational programs and resources for African diaspora families.', 'draft', NULL, (SELECT id FROM public.communities WHERE slug = 'nigerian-diaspora'), ARRAY['education', 'community', 'center', 'family'], 100000.00, 0.00, '2024-07-01', '2025-06-30'),
('Women Entrepreneurship Program', 'Supporting African women entrepreneurs through training, networking, and funding opportunities.', 'active', NULL, (SELECT id FROM public.communities WHERE slug = 'african-women-tech'), ARRAY['women', 'entrepreneurship', 'training', 'funding'], 75000.00, 25000.00, '2024-03-01', '2024-11-30'),
('Cultural Heritage Preservation', 'Documenting and preserving African cultural heritage through digital archives and storytelling.', 'active', NULL, (SELECT id FROM public.communities WHERE slug = 'sa-business-network'), ARRAY['culture', 'heritage', 'preservation', 'digital'], 30000.00, 8000.00, '2024-02-01', '2024-10-31');

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type, related_id) VALUES
(NULL, 'Welcome to The New Alkebulan!', 'Thank you for joining our community. We''re excited to have you here!', 'welcome', NULL),
(NULL, 'New Event in Your Community', 'A new event "Diaspora Business Summit 2024" has been added to Nigerian Diaspora Network.', 'event', NULL),
(NULL, 'New Post in Your Community', 'Someone posted "Business Opportunities in Tech" in Ghanaian Entrepreneurs.', 'post', NULL),
(NULL, 'Project Update', 'Your project "African Tech Startup Incubator" has received new funding.', 'project', NULL);

-- Update community member counts (this will be done automatically in the real app)
UPDATE public.communities SET member_count = 1250 WHERE slug = 'nigerian-diaspora';
UPDATE public.communities SET member_count = 890 WHERE slug = 'ghanaian-entrepreneurs';
UPDATE public.communities SET member_count = 567 WHERE slug = 'kenyan-tech-hub';
UPDATE public.communities SET member_count = 432 WHERE slug = 'sa-business-network';
UPDATE public.communities SET member_count = 789 WHERE slug = 'african-women-tech'; 