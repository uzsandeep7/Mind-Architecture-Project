-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 100,
  available_seats INTEGER NOT NULL DEFAULT 100,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event bookings table
CREATE TABLE public.event_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  seats INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  cover_image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 100,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  topic TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery table
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Events policies (public read, admin write)
CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all events" ON public.events FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create events" ON public.events FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Event bookings policies
CREATE POLICY "Users can view their own bookings" ON public.event_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON public.event_bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create bookings" ON public.event_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update bookings" ON public.event_bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can cancel their own bookings" ON public.event_bookings FOR UPDATE USING (auth.uid() = user_id);

-- Books policies (public read, admin write)
CREATE POLICY "Published books are viewable by everyone" ON public.books FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all books" ON public.books FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create books" ON public.books FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update books" ON public.books FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete books" ON public.books FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Cart items policies
CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove from cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Consultations policies
CREATE POLICY "Users can view their own consultations" ON public.consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all consultations" ON public.consultations FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create consultations" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update consultations" ON public.consultations FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can cancel their own consultations" ON public.consultations FOR UPDATE USING (auth.uid() = user_id);

-- Gallery policies (public read, admin write)
CREATE POLICY "Published gallery items are viewable by everyone" ON public.gallery FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Contact messages policies
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_bookings_updated_at BEFORE UPDATE ON public.event_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample events
INSERT INTO public.events (title, description, date, venue, total_seats, available_seats, price, is_published) VALUES
('Leadership Summit 2026', 'Join us for an inspiring day of leadership insights and networking opportunities.', '2026-03-15 09:00:00+00', 'Grand Conference Center, New York', 500, 450, 149.99, true),
('Women in Business Conference', 'Empowering women leaders with strategies for success in the modern workplace.', '2026-04-22 10:00:00+00', 'Marriott Downtown, Chicago', 300, 280, 199.99, true),
('Entrepreneurship Workshop', 'Hands-on workshop for aspiring entrepreneurs to build their business foundation.', '2026-05-10 13:00:00+00', 'Innovation Hub, San Francisco', 100, 85, 79.99, true);

-- Insert sample books
INSERT INTO public.books (title, description, author, price, category, stock, is_published) VALUES
('The Art of Leadership', 'A comprehensive guide to becoming an effective leader in any organization.', 'Dr. Sarah Johnson', 24.99, 'Leadership', 100, true),
('Mindful Success', 'Discover the power of mindfulness in achieving personal and professional success.', 'Dr. Sarah Johnson', 19.99, 'Self-Help', 150, true),
('Breaking Barriers', 'Stories and strategies for overcoming obstacles in your career journey.', 'Dr. Sarah Johnson', 29.99, 'Career', 80, true),
('The Power of Purpose', 'Find your purpose and align your life with your deepest values.', 'Dr. Sarah Johnson', 22.99, 'Personal Development', 120, true);

-- Insert sample gallery items
INSERT INTO public.gallery (title, image_url, category, display_order, is_published) VALUES
('Leadership Summit 2025', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Events', 1, true),
('Book Signing Event', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', 'Events', 2, true),
('Keynote Speech', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 'Speaking', 3, true),
('Workshop Session', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'Workshops', 4, true),
('Team Building', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', 'Corporate', 5, true),
('Award Ceremony', 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800', 'Awards', 6, true);