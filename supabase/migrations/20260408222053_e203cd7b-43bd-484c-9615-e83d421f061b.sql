
-- Drop all permissive ALL policies and replace with email-restricted ones

-- categories
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (auth.email() = 'rmcomputerxp@gmail.com')
  WITH CHECK (auth.email() = 'rmcomputerxp@gmail.com');

-- catalog_items
DROP POLICY IF EXISTS "Authenticated users can manage catalog_items" ON public.catalog_items;
CREATE POLICY "Admin can manage catalog_items" ON public.catalog_items
  FOR ALL TO authenticated
  USING (auth.email() = 'rmcomputerxp@gmail.com')
  WITH CHECK (auth.email() = 'rmcomputerxp@gmail.com');

-- business_hours
DROP POLICY IF EXISTS "Authenticated users can manage business_hours" ON public.business_hours;
CREATE POLICY "Admin can manage business_hours" ON public.business_hours
  FOR ALL TO authenticated
  USING (auth.email() = 'rmcomputerxp@gmail.com')
  WITH CHECK (auth.email() = 'rmcomputerxp@gmail.com');

-- contact_info
DROP POLICY IF EXISTS "Authenticated users can manage contact_info" ON public.contact_info;
CREATE POLICY "Admin can manage contact_info" ON public.contact_info
  FOR ALL TO authenticated
  USING (auth.email() = 'rmcomputerxp@gmail.com')
  WITH CHECK (auth.email() = 'rmcomputerxp@gmail.com');

-- site_content
DROP POLICY IF EXISTS "Authenticated users can manage site_content" ON public.site_content;
CREATE POLICY "Admin can manage site_content" ON public.site_content
  FOR ALL TO authenticated
  USING (auth.email() = 'rmcomputerxp@gmail.com')
  WITH CHECK (auth.email() = 'rmcomputerxp@gmail.com');

-- social_links
DROP POLICY IF EXISTS "Authenticated users can manage social_links" ON public.social_links;
CREATE POLICY "Admin can manage social_links" ON public.social_links
  FOR ALL TO authenticated
  USING (auth.email() = 'rmcomputerxp@gmail.com')
  WITH CHECK (auth.email() = 'rmcomputerxp@gmail.com');

-- Storage: restrict uploads to admin only
DROP POLICY IF EXISTS "Authenticated users can upload site-images" ON storage.objects;
CREATE POLICY "Admin can upload site-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND auth.email() = 'rmcomputerxp@gmail.com');

DROP POLICY IF EXISTS "Authenticated users can update site-images" ON storage.objects;
CREATE POLICY "Admin can update site-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND auth.email() = 'rmcomputerxp@gmail.com');

DROP POLICY IF EXISTS "Authenticated users can delete site-images" ON storage.objects;
CREATE POLICY "Admin can delete site-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND auth.email() = 'rmcomputerxp@gmail.com');
