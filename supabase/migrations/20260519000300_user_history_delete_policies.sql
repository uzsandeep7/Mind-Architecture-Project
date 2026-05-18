DROP POLICY IF EXISTS "Users can delete their own event bookings" ON public.event_bookings;
CREATE POLICY "Users can delete their own event bookings"
ON public.event_bookings
FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
CREATE POLICY "Users can delete their own orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own consultations" ON public.consultations;
CREATE POLICY "Users can delete their own consultations"
ON public.consultations
FOR DELETE
USING (auth.uid() = user_id);
