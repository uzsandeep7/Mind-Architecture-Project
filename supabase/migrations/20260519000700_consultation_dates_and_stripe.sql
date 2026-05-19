CREATE TABLE IF NOT EXISTS public.consultation_date_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  date_value DATE NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultation_date_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published consultation date blocks are viewable by everyone" ON public.consultation_date_blocks;
CREATE POLICY "Published consultation date blocks are viewable by everyone"
ON public.consultation_date_blocks
FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins and owners can manage consultation date blocks" ON public.consultation_date_blocks;
CREATE POLICY "Admins and owners can manage consultation date blocks"
ON public.consultation_date_blocks
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

DROP TRIGGER IF EXISTS update_consultation_date_blocks_updated_at ON public.consultation_date_blocks;
CREATE TRIGGER update_consultation_date_blocks_updated_at
BEFORE UPDATE ON public.consultation_date_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.consultation_date_blocks (label, date_value, display_order, is_published)
VALUES
  ('Next Monday', (CURRENT_DATE + ((8 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 1))::date, 1, true),
  ('Next Tuesday', (CURRENT_DATE + ((9 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 1))::date, 2, true),
  ('Next Wednesday', (CURRENT_DATE + ((10 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 1))::date, 3, true),
  ('Next Thursday', (CURRENT_DATE + ((11 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 1))::date, 4, true),
  ('Next Friday', (CURRENT_DATE + ((12 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7 + 1))::date, 5, true)
ON CONFLICT DO NOTHING;

WITH ordered_services AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY display_order NULLS LAST, created_at, id) AS next_order
  FROM public.consultation_services
)
UPDATE public.consultation_services AS service
SET display_order = ordered_services.next_order
FROM ordered_services
WHERE service.id = ordered_services.id;

WITH ordered_times AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY display_order NULLS LAST, time_value, created_at, id) AS next_order
  FROM public.consultation_time_blocks
)
UPDATE public.consultation_time_blocks AS block
SET display_order = ordered_times.next_order
FROM ordered_times
WHERE block.id = ordered_times.id;

WITH ordered_dates AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY display_order NULLS LAST, date_value, created_at, id) AS next_order
  FROM public.consultation_date_blocks
)
UPDATE public.consultation_date_blocks AS block
SET display_order = ordered_dates.next_order
FROM ordered_dates
WHERE block.id = ordered_dates.id;

CREATE UNIQUE INDEX IF NOT EXISTS consultation_services_display_order_unique
ON public.consultation_services(display_order);

CREATE UNIQUE INDEX IF NOT EXISTS consultation_time_blocks_display_order_unique
ON public.consultation_time_blocks(display_order);

CREATE UNIQUE INDEX IF NOT EXISTS consultation_date_blocks_display_order_unique
ON public.consultation_date_blocks(display_order);
