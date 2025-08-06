-- Add role field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Update existing profiles to have 'admin' role (you can change this later)
UPDATE public.profiles SET role = 'admin' WHERE role IS NULL;