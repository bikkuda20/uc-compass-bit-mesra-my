-- Update RLS policies to allow authenticated users to view users if they are admin
-- First, let's update the admin function to be more reliable
CREATE OR REPLACE FUNCTION public.is_admin(user_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = COALESCE(user_email, (current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    AND role = 'admin' 
    AND is_active = true
  );
$function$

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can insert users" ON public.users;
DROP POLICY IF EXISTS "Admin users can update users" ON public.users;
DROP POLICY IF EXISTS "Admin users can delete users" ON public.users;

-- Create new simplified policies
CREATE POLICY "Authenticated users can view all users if admin" 
ON public.users 
FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Authenticated users can insert users if admin" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated users can update users if admin" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Authenticated users can delete users if admin" 
ON public.users 
FOR DELETE 
TO authenticated
USING (public.is_admin());