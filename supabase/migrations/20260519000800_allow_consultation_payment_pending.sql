ALTER TABLE public.consultations
DROP CONSTRAINT IF EXISTS consultations_status_check;

ALTER TABLE public.consultations
ADD CONSTRAINT consultations_status_check
CHECK (status IN ('pending', 'payment_pending', 'confirmed', 'completed', 'cancelled'));
