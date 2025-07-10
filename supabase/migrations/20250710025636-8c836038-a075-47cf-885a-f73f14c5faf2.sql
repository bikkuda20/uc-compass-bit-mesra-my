-- Update the admin function to be more reliable
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