-- Populate notifications table with sample data
-- This script should be run after the notifications table is created

-- First, let's check if we have any users in the profiles table
SELECT COUNT(*) as user_count FROM profiles;

-- Insert sample notifications for existing users
-- Note: Replace 'user-id-here' with actual user IDs from your profiles table

-- Sample friend request notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id, created_at) VALUES
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'Friend Request',
  'Sarah Johnson sent you a friend request',
  'friend_request',
  false,
  gen_random_uuid(), -- This would be the friend request ID
  NOW() - INTERVAL '30 minutes'
),
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'Friend Request',
  'Marcus Williams sent you a friend request',
  'friend_request',
  false,
  gen_random_uuid(),
  NOW() - INTERVAL '2 hours'
);

-- Sample message notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id, created_at) VALUES
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'New Message',
  'You received a message from Sarah Johnson',
  'message',
  false,
  gen_random_uuid(),
  NOW() - INTERVAL '2 hours'
),
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'New Message',
  'You received a message from David Chen about your business proposal',
  'message',
  true,
  gen_random_uuid(),
  NOW() - INTERVAL '2 days'
);

-- Sample comment notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id, created_at) VALUES
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'New Comment',
  'Marcus Williams commented on your post about sustainable farming',
  'comment',
  false,
  gen_random_uuid(),
  NOW() - INTERVAL '4 hours'
);

-- Sample mention notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id, created_at) VALUES
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'You were mentioned',
  'You''ve been mentioned in the African Heritage community discussion',
  'mention',
  false,
  gen_random_uuid(),
  NOW() - INTERVAL '6 hours'
);

-- Sample like notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id, created_at) VALUES
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'Post Liked',
  'Amara Okafor and 12 others liked your marketplace listing',
  'like',
  true,
  gen_random_uuid(),
  NOW() - INTERVAL '8 hours'
);

-- Sample follow notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id, created_at) VALUES
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'New Follower',
  'Kwame Asante started following you',
  'follow',
  true,
  gen_random_uuid(),
  NOW() - INTERVAL '12 hours'
);

-- Sample system notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id, created_at) VALUES
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'Platform Update',
  'New features have been added to the learning hub',
  'system',
  true,
  gen_random_uuid(),
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM profiles LIMIT 1), -- Replace with actual user ID
  'Investment Opportunity',
  'New investment opportunities are available in the funding section',
  'system',
  true,
  gen_random_uuid(),
  NOW() - INTERVAL '3 days'
);

-- Verify the insertions
SELECT 
  type,
  title,
  is_read,
  created_at
FROM notifications 
ORDER BY created_at DESC;

-- Count notifications by type
SELECT 
  type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
FROM notifications 
GROUP BY type
ORDER BY count DESC;
