CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.blog_comments;
CREATE POLICY "Comments are viewable by everyone"
ON public.blog_comments
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.blog_comments;
CREATE POLICY "Users can create comments"
ON public.blog_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.blog_comments;
CREATE POLICY "Users can update their own comments"
ON public.blog_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.blog_comments;
CREATE POLICY "Users can delete their own comments"
ON public.blog_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete any comment" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins and owners can delete any comment" ON public.blog_comments;
CREATE POLICY "Admins and owners can delete any comment"
ON public.blog_comments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
