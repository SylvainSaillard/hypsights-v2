-- Enable Admin Access on Core Tables
-- Execute this in Supabase SQL Editor to allow admins to view user briefs

-- 1. Briefs
DROP POLICY IF EXISTS "admins_read_all_briefs" ON public.briefs;
CREATE POLICY "admins_read_all_briefs" ON public.briefs
FOR SELECT
USING (
  auth.uid() = user_id OR 
  (select role from public.users_metadata where user_id = auth.uid()) = 'admin'
);

-- 2. Solutions
DROP POLICY IF EXISTS "admins_read_all_solutions" ON public.solutions;
CREATE POLICY "admins_read_all_solutions" ON public.solutions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.briefs 
    WHERE briefs.id = solutions.brief_id 
    AND (briefs.user_id = auth.uid() OR (select role from public.users_metadata where user_id = auth.uid()) = 'admin')
  )
);

-- 3. Supplier Match Profiles
DROP POLICY IF EXISTS "admins_read_all_supplier_profiles" ON public.supplier_match_profiles;
CREATE POLICY "admins_read_all_supplier_profiles" ON public.supplier_match_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.briefs 
    WHERE briefs.id = supplier_match_profiles.brief_id 
    AND (briefs.user_id = auth.uid() OR (select role from public.users_metadata where user_id = auth.uid()) = 'admin')
  )
);
