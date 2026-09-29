CREATE TABLE public.scan_rate_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.scan_rate_events TO service_role;
ALTER TABLE public.scan_rate_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX scan_rate_events_ip_time ON public.scan_rate_events (ip_hash, created_at DESC);
COMMENT ON TABLE public.scan_rate_events IS 'Per-IP scan request timestamps for rate limiting. Stores only a salted SHA-256 hash of the IP. Never store concern text here.';

CREATE OR REPLACE FUNCTION public.check_scan_rate_limit(_ip_hash text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  short_count int;
  day_count int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(_ip_hash));
  DELETE FROM public.scan_rate_events WHERE created_at < now() - interval '1 day';
  SELECT count(*) FILTER (WHERE created_at > now() - interval '10 minutes'), count(*)
    INTO short_count, day_count
    FROM public.scan_rate_events WHERE ip_hash = _ip_hash;
  IF short_count >= 10 THEN RETURN 'short'; END IF;
  IF day_count >= 60 THEN RETURN 'day'; END IF;
  INSERT INTO public.scan_rate_events (ip_hash) VALUES (_ip_hash);
  RETURN 'ok';
END;
$$;
REVOKE ALL ON FUNCTION public.check_scan_rate_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_scan_rate_limit(text) TO service_role;