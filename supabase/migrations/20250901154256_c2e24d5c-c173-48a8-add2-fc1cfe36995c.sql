-- Remove public read access from vehicle_location and restrict to authenticated users only

-- Ensure RLS is enabled (no FORCE)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'vehicle_location'
  ) THEN
    ALTER TABLE public.vehicle_location ENABLE ROW LEVEL SECURITY;
  END IF;
END$$;

-- Drop the public SELECT policy that allowed anyone to read
DO $$
DECLARE pol_name text := 'Users can view all vehicle locations';
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vehicle_location' AND policyname = pol_name
  ) THEN
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.vehicle_location;', pol_name);
  END IF;
END$$;

-- Ensure an authenticated-only SELECT policy exists (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vehicle_location' AND policyname = 'auth_can_read_vehicle_location'
  ) THEN
    CREATE POLICY auth_can_read_vehicle_location
      ON public.vehicle_location
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END$$;
