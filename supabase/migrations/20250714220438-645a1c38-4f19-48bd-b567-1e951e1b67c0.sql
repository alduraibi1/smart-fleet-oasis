-- إنشاء enum للأدوار
CREATE TYPE public.app_role AS ENUM ('admin', 'accountant', 'employee', 'manager');

-- إنشاء جدول ملفات المستخدمين
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  position TEXT,
  department TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول أدوار المستخدمين
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- إنشاء جدول الصلاحيات
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50) NOT NULL, -- accounting, vehicles, contracts, etc
  action VARCHAR(50) NOT NULL, -- read, write, delete, manage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول ربط الأدوار بالصلاحيات
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (role, permission_id)
);

-- إنشاء جدول سجل أنشطة المستخدمين
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50), -- table name or module
  resource_id UUID, -- record id
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- إنشاء دالة للتحقق من الأدوار (Security Definer لتجنب RLS المتداخل)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- إنشاء دالة للتحقق من الصلاحيات
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
    AND p.name = _permission_name
  )
$$;

-- إنشاء دالة للحصول على أدوار المستخدم
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- إنشاء دالة لإنشاء ملف المستخدم تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- إضافة دور موظف افتراضياً للمستخدمين الجدد
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger للمستخدمين الجدد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- سياسات RLS للملفات الشخصية
CREATE POLICY "Users can view their own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS للأدوار
CREATE POLICY "Admins and managers can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS للصلاحيات
CREATE POLICY "Authenticated users can view permissions" 
ON public.permissions 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS لربط الأدوار بالصلاحيات
CREATE POLICY "Authenticated users can view role permissions" 
ON public.role_permissions 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS لسجل الأنشطة
CREATE POLICY "Users can view their own activities" 
ON public.activity_logs 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "System can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (true);

-- إدراج الصلاحيات الأساسية
INSERT INTO public.permissions (name, description, module, action) VALUES
-- صلاحيات المركبات
('vehicles.read', 'عرض المركبات', 'vehicles', 'read'),
('vehicles.write', 'إضافة وتعديل المركبات', 'vehicles', 'write'),
('vehicles.delete', 'حذف المركبات', 'vehicles', 'delete'),
('vehicles.manage', 'إدارة كاملة للمركبات', 'vehicles', 'manage'),

-- صلاحيات العقود
('contracts.read', 'عرض العقود', 'contracts', 'read'),
('contracts.write', 'إنشاء وتعديل العقود', 'contracts', 'write'),
('contracts.delete', 'حذف العقود', 'contracts', 'delete'),
('contracts.manage', 'إدارة كاملة للعقود', 'contracts', 'manage'),

-- صلاحيات المحاسبة
('accounting.read', 'عرض البيانات المحاسبية', 'accounting', 'read'),
('accounting.write', 'إدخال وتعديل البيانات المحاسبية', 'accounting', 'write'),
('accounting.delete', 'حذف البيانات المحاسبية', 'accounting', 'delete'),
('accounting.manage', 'إدارة كاملة للمحاسبة', 'accounting', 'manage'),

-- صلاحيات العملاء
('customers.read', 'عرض العملاء', 'customers', 'read'),
('customers.write', 'إضافة وتعديل العملاء', 'customers', 'write'),
('customers.delete', 'حذف العملاء', 'customers', 'delete'),

-- صلاحيات التقارير
('reports.read', 'عرض التقارير', 'reports', 'read'),
('reports.export', 'تصدير التقارير', 'reports', 'export'),

-- صلاحيات إدارة النظام
('users.read', 'عرض المستخدمين', 'system', 'read'),
('users.write', 'إضافة وتعديل المستخدمين', 'system', 'write'),
('users.delete', 'حذف المستخدمين', 'system', 'delete'),
('roles.manage', 'إدارة الأدوار والصلاحيات', 'system', 'manage'),
('system.admin', 'إدارة كاملة للنظام', 'system', 'admin');

-- ربط الأدوار بالصلاحيات
-- صلاحيات المدير (كل شيء)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions;

-- صلاحيات المحاسب
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accountant'::app_role, id FROM public.permissions 
WHERE name IN (
  'vehicles.read', 'contracts.read', 'customers.read',
  'accounting.read', 'accounting.write', 'accounting.manage',
  'reports.read', 'reports.export'
);

-- صلاحيات المدير (ليس admin)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions 
WHERE name NOT IN ('system.admin', 'roles.manage', 'users.delete');

-- صلاحيات الموظف
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'employee'::app_role, id FROM public.permissions 
WHERE name IN (
  'vehicles.read', 'contracts.read', 'customers.read',
  'accounting.read', 'reports.read'
);

-- إنشاء فهارس للأداء
CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_permissions_module ON public.permissions(module);

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();