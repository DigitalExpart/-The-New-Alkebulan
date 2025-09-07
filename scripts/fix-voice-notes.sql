-- Fix existing voice notes in the database
-- This script updates existing messages that are voice notes but don't have the correct message_type

-- Update messages that contain voice_ in the filename to have message_type = 'audio'
UPDATE public.messages 
SET message_type = 'audio'
WHERE content LIKE '%voice_%' 
AND message_type != 'audio';

-- Update messages that contain .webm extension to have message_type = 'audio'
UPDATE public.messages 
SET message_type = 'audio'
WHERE content LIKE '%.webm%' 
AND message_type != 'audio';

-- Update messages that contain .mp3 extension to have message_type = 'audio'
UPDATE public.messages 
SET message_type = 'audio'
WHERE content LIKE '%.mp3%' 
AND message_type != 'audio';

-- Update messages that contain .wav extension to have message_type = 'audio'
UPDATE public.messages 
SET message_type = 'audio'
WHERE content LIKE '%.wav%' 
AND message_type != 'audio';

-- Update messages that contain .ogg extension to have message_type = 'audio'
UPDATE public.messages 
SET message_type = 'audio'
WHERE content LIKE '%.ogg%' 
AND message_type != 'audio';

-- Show how many messages were updated
SELECT 
    COUNT(*) as total_voice_notes,
    COUNT(CASE WHEN message_type = 'audio' THEN 1 END) as properly_tagged_voice_notes
FROM public.messages 
WHERE content LIKE '%voice_%' 
   OR content LIKE '%.webm%' 
   OR content LIKE '%.mp3%' 
   OR content LIKE '%.wav%' 
   OR content LIKE '%.ogg%';
