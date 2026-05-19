DROP POLICY IF EXISTS "Admins can delete any comment" ON public.blog_comments;

CREATE POLICY "Admins and owners can delete any comment"
ON public.blog_comments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));
