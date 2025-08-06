-- CRITICAL SECURITY FIXES

-- 1. First, let's properly secure the profiles table by removing plain text passwords
-- The profiles table should not store passwords - Supabase Auth handles this
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create a proper profiles table for user metadata only
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nik VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Secure RLS policies for profiles - users can only see/edit their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Secure clinical_pathways table - only authenticated users can access
DROP POLICY IF EXISTS "Allow all operations on clinical_pathways" ON public.clinical_pathways;

CREATE POLICY "Authenticated users can view clinical pathways" 
ON public.clinical_pathways 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clinical pathways" 
ON public.clinical_pathways 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clinical pathways" 
ON public.clinical_pathways 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clinical pathways" 
ON public.clinical_pathways 
FOR DELETE 
TO authenticated
USING (true);

-- 5. Secure clinical_pathway_checklist table
DROP POLICY IF EXISTS "Allow all operations on clinical_pathway_checklist" ON public.clinical_pathway_checklist;

CREATE POLICY "Authenticated users can view checklists" 
ON public.clinical_pathway_checklist 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert checklists" 
ON public.clinical_pathway_checklist 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update checklists" 
ON public.clinical_pathway_checklist 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete checklists" 
ON public.clinical_pathway_checklist 
FOR DELETE 
TO authenticated
USING (true);

-- 6. Secure other tables
DROP POLICY IF EXISTS "Allow all operations on compliance_overrides" ON public.compliance_overrides;

CREATE POLICY "Authenticated users can access compliance overrides" 
ON public.compliance_overrides 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on monthly_summary" ON public.monthly_summary;

CREATE POLICY "Authenticated users can access monthly summary" 
ON public.monthly_summary 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nik, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nik', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();