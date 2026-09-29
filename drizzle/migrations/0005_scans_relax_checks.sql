ALTER TABLE public.scans DROP CONSTRAINT scans_input_type_check;
ALTER TABLE public.scans ADD CONSTRAINT scans_input_type_check CHECK (input_type IN ('url','text','description'));
ALTER TABLE public.scans DROP CONSTRAINT scans_risk_level_check;