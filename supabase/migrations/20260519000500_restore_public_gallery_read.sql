DROP POLICY IF EXISTS "Published gallery items are viewable by everyone" ON public.gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can view all gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can create gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can update gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can delete gallery items" ON public.gallery;

CREATE POLICY "Published gallery items are viewable by everyone"
ON public.gallery
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins and owners can view all gallery items"
ON public.gallery
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Admins and owners can create gallery items"
ON public.gallery
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Admins and owners can update gallery items"
ON public.gallery
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Admins and owners can delete gallery items"
ON public.gallery
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-assets', 'admin-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view admin assets" ON storage.objects;
CREATE POLICY "Public can view admin assets"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'admin-assets');
