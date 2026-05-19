CREATE TABLE IF NOT EXISTS public.consultation_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price NUMERIC NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consultation_time_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  time_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultation_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_time_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published consultation services are viewable by everyone" ON public.consultation_services;
CREATE POLICY "Published consultation services are viewable by everyone"
ON public.consultation_services
FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins and owners can manage consultation services" ON public.consultation_services;
CREATE POLICY "Admins and owners can manage consultation services"
ON public.consultation_services
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

DROP POLICY IF EXISTS "Published consultation time blocks are viewable by everyone" ON public.consultation_time_blocks;
CREATE POLICY "Published consultation time blocks are viewable by everyone"
ON public.consultation_time_blocks
FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins and owners can manage consultation time blocks" ON public.consultation_time_blocks;
CREATE POLICY "Admins and owners can manage consultation time blocks"
ON public.consultation_time_blocks
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

DROP TRIGGER IF EXISTS update_consultation_services_updated_at ON public.consultation_services;
CREATE TRIGGER update_consultation_services_updated_at
BEFORE UPDATE ON public.consultation_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultation_time_blocks_updated_at ON public.consultation_time_blocks;
CREATE TRIGGER update_consultation_time_blocks_updated_at
BEFORE UPDATE ON public.consultation_time_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.consultation_services (slug, title, description, duration_minutes, price, display_order, is_published)
VALUES
  ('discovery', 'Discovery Call', 'A free introductory call to discuss your goals and how Mind Architecture can help.', 30, 0, 1, true),
  ('coaching', '1-on-1 Coaching', 'A personalised coaching session tailored to your specific challenges.', 60, 99, 2, true),
  ('strategic', 'Strategic Planning', 'A focused strategy session to map out your transformation journey.', 90, 249, 3, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price = EXCLUDED.price,
  display_order = EXCLUDED.display_order,
  is_published = EXCLUDED.is_published;

INSERT INTO public.consultation_time_blocks (label, time_value, display_order, is_published)
VALUES
  ('9:00 AM', '09:00', 1, true),
  ('10:00 AM', '10:00', 2, true),
  ('11:00 AM', '11:00', 3, true),
  ('1:30 PM', '13:30', 4, true),
  ('3:00 PM', '15:00', 5, true),
  ('4:30 PM', '16:30', 6, true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Users can view booked event summaries" ON public.events;
CREATE POLICY "Users can view booked event summaries"
ON public.events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.event_bookings
    WHERE event_bookings.event_id = events.id
      AND event_bookings.user_id = auth.uid()
  )
);
