CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published testimonials are viewable by everyone" ON public.testimonials;
CREATE POLICY "Published testimonials are viewable by everyone"
ON public.testimonials
FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Admins and owners can view all testimonials" ON public.testimonials;
CREATE POLICY "Admins and owners can view all testimonials"
ON public.testimonials
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins and owners can create testimonials" ON public.testimonials;
CREATE POLICY "Admins and owners can create testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins and owners can update testimonials" ON public.testimonials;
CREATE POLICY "Admins and owners can update testimonials"
ON public.testimonials
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Admins and owners can delete testimonials" ON public.testimonials;
CREATE POLICY "Admins and owners can delete testimonials"
ON public.testimonials
FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
