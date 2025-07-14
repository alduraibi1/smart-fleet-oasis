-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plate_number VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'out_of_service')),
  daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  mileage INTEGER NOT NULL DEFAULT 0,
  
  -- Vehicle Details
  vin VARCHAR(17) UNIQUE,
  engine_number VARCHAR(50),
  chassis_number VARCHAR(50),
  fuel_type VARCHAR(20) NOT NULL DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric')),
  transmission VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (transmission IN ('manual', 'automatic')),
  seating_capacity INTEGER NOT NULL DEFAULT 5,
  features TEXT[], -- Array of features
  
  -- Owner reference
  owner_id UUID,
  
  -- Administrative
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create vehicle_owners table
CREATE TABLE public.vehicle_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  national_id VARCHAR(50) UNIQUE,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle_documents table
CREATE TABLE public.vehicle_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('license', 'insurance', 'inspection', 'registration', 'other')),
  file_url TEXT,
  file_name VARCHAR(255),
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'near_expiry')),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create vehicle_images table
CREATE TABLE public.vehicle_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'other' CHECK (type IN ('exterior', 'interior', 'damage', 'other')),
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create vehicle_maintenance table
CREATE TABLE public.vehicle_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'overdue', 'completed')),
  maintenance_type VARCHAR(50) NOT NULL,
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  cost DECIMAL(10,2),
  notes TEXT,
  parts_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create vehicle_location table
CREATE TABLE public.vehicle_location (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_tracked BOOLEAN NOT NULL DEFAULT false
);

-- Add foreign key constraint for vehicle owners
ALTER TABLE public.vehicles ADD CONSTRAINT fk_vehicles_owner 
  FOREIGN KEY (owner_id) REFERENCES public.vehicle_owners(id);

-- Enable Row Level Security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_location ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicles
CREATE POLICY "Users can view all vehicles" 
ON public.vehicles FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert vehicles" 
ON public.vehicles FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update vehicles" 
ON public.vehicles FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete vehicles" 
ON public.vehicles FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for vehicle_owners
CREATE POLICY "Users can view all vehicle owners" 
ON public.vehicle_owners FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage vehicle owners" 
ON public.vehicle_owners FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for vehicle_documents
CREATE POLICY "Users can view all vehicle documents" 
ON public.vehicle_documents FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage vehicle documents" 
ON public.vehicle_documents FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for vehicle_images
CREATE POLICY "Users can view all vehicle images" 
ON public.vehicle_images FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage vehicle images" 
ON public.vehicle_images FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for vehicle_maintenance
CREATE POLICY "Users can view all vehicle maintenance" 
ON public.vehicle_maintenance FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage vehicle maintenance" 
ON public.vehicle_maintenance FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for vehicle_location
CREATE POLICY "Users can view all vehicle locations" 
ON public.vehicle_location FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage vehicle locations" 
ON public.vehicle_location FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_plate_number ON public.vehicles(plate_number);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_brand_model ON public.vehicles(brand, model);
CREATE INDEX idx_vehicles_owner_id ON public.vehicles(owner_id);
CREATE INDEX idx_vehicle_documents_vehicle_id ON public.vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_documents_expiry_date ON public.vehicle_documents(expiry_date);
CREATE INDEX idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_maintenance_vehicle_id ON public.vehicle_maintenance(vehicle_id);
CREATE INDEX idx_vehicle_maintenance_status ON public.vehicle_maintenance(status);
CREATE INDEX idx_vehicle_location_vehicle_id ON public.vehicle_location(vehicle_id);

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_owners_updated_at
  BEFORE UPDATE ON public.vehicle_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_maintenance_updated_at
  BEFORE UPDATE ON public.vehicle_maintenance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();