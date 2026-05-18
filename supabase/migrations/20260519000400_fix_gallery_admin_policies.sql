DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can view all gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can create gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can update gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins and owners can delete gallery items" ON public.gallery;

CREATE POLICY "Admins and owners can view all gallery items"
ON public.gallery
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Admins and owners can create gallery items"
ON public.gallery
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Admins and owners can update gallery items"
ON public.gallery
FOR UPDATE
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
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);
