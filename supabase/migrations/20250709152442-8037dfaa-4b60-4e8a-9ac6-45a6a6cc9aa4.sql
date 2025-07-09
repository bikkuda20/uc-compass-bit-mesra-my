-- Fix infinite recursion in users table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can insert users" ON public.users;
DROP POLICY IF EXISTS "Admin users can update users" ON public.users;
DROP POLICY IF EXISTS "Admin users can delete users" ON public.users;

-- Create a helper function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = user_email AND role = 'admin' AND is_active = true
  );
$$;

-- Create new policies using the helper function
CREATE POLICY "Admin users can view all users" ON public.users
  FOR SELECT 
  USING (public.is_admin((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

CREATE POLICY "Admin users can insert users" ON public.users
  FOR INSERT 
  WITH CHECK (public.is_admin((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

CREATE POLICY "Admin users can update users" ON public.users
  FOR UPDATE 
  USING (public.is_admin((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

CREATE POLICY "Admin users can delete users" ON public.users
  FOR DELETE 
  USING (public.is_admin((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));