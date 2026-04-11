
-- categories
DROP POLICY "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'))
  WITH CHECK (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'));

-- catalog_items
DROP POLICY "Admin can manage catalog_items" ON public.catalog_items;
CREATE POLICY "Admin can manage catalog_items" ON public.catalog_items
  FOR ALL TO authenticated
  USING (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'))
  WITH CHECK (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'));

-- business_hours
DROP POLICY "Admin can manage business_hours" ON public.business_hours;
CREATE POLICY "Admin can manage business_hours" ON public.business_hours
  FOR ALL TO authenticated
  USING (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'))
  WITH CHECK (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'));

-- contact_info
DROP POLICY "Admin can manage contact_info" ON public.contact_info;
CREATE POLICY "Admin can manage contact_info" ON public.contact_info
  FOR ALL TO authenticated
  USING (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'))
  WITH CHECK (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'));

-- site_content
DROP POLICY "Admin can manage site_content" ON public.site_content;
CREATE POLICY "Admin can manage site_content" ON public.site_content
  FOR ALL TO authenticated
  USING (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'))
  WITH CHECK (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'));

-- social_links
DROP POLICY "Admin can manage social_links" ON public.social_links;
CREATE POLICY "Admin can manage social_links" ON public.social_links
  FOR ALL TO authenticated
  USING (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'))
  WITH CHECK (auth.email() IN ('rmcomputerxp@gmail.com', 'anyelinaguillermo4@gmail.com'));
