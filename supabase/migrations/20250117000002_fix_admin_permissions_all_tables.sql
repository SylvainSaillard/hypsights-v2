-- Enable Admin Access on ALL relevant tables
-- Execute this in Supabase SQL Editor to ensure admins can view all brief details

-- 1. Suppliers (Public read usually, but ensure admin access)
DROP POLICY IF EXISTS "admins_read_all_suppliers" ON public.suppliers;
CREATE POLICY "admins_read_all_suppliers" ON public.suppliers
FOR SELECT
USING (true); -- Usually suppliers are public or visible to authenticated users. If strictly private, restrict to admin.

-- 2. Products
DROP POLICY IF EXISTS "admins_read_all_products" ON public.products;
CREATE POLICY "admins_read_all_products" ON public.products
FOR SELECT
USING (true); -- Similarly, products are usually visible.

-- 3. Supplier Match Profiles (CRITICAL for results)
DROP POLICY IF EXISTS "admins_read_all_supplier_profiles" ON public.supplier_match_profiles;
CREATE POLICY "admins_read_all_supplier_profiles" ON public.supplier_match_profiles
FOR SELECT
USING (
  auth.uid() = (select user_id from briefs where id = brief_id) OR 
  (select role from public.users_metadata where user_id = auth.uid()) = 'admin'
);

-- 4. Solutions (CRITICAL for structure)
DROP POLICY IF EXISTS "admins_read_all_solutions" ON public.solutions;
CREATE POLICY "admins_read_all_solutions" ON public.solutions
FOR SELECT
USING (
  auth.uid() = (select user_id from briefs where id = brief_id) OR 
  (select role from public.users_metadata where user_id = auth.uid()) = 'admin'
);

-- 5. Briefs (CRITICAL for access)
DROP POLICY IF EXISTS "admins_read_all_briefs" ON public.briefs;
CREATE POLICY "admins_read_all_briefs" ON public.briefs
FOR SELECT
USING (
  auth.uid() = user_id OR 
  (select role from public.users_metadata where user_id = auth.uid()) = 'admin'
);
