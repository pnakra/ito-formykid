ALTER TABLE public.waitlist_signups ADD COLUMN roles text[];

COMMENT ON COLUMN public.waitlist_signups.role IS 'DEPRECATED: single role value; replaced by roles text[]';
COMMENT ON COLUMN public.waitlist_signups.roles IS 'One or more roles: parent, aunt_uncle, grandparent, educator';

GRANT SELECT, INSERT, UPDATE ON public.waitlist_signups TO service_role;