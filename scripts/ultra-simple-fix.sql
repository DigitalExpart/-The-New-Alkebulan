-- Ultra simple fix - just delete null records and set constraints

-- Delete records with null user_id
DELETE FROM public.profiles WHERE user_id IS NULL;

-- Set NOT NULL constraint
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Success message
SELECT 'Fixed!' as result; 