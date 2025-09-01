import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'accountant' | 'employee' | 'manager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRoles: UserRole[];
  userProfile: any;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => Promise<boolean>;
  hasPermissionSync: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // جلب أدوار المستخدم
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      
      // Filter and cast roles to ensure they match our UserRole type
      const validRoles: UserRole[] = (data?.map(r => r.role) || [])
        .filter((role): role is UserRole => 
          ['admin', 'accountant', 'employee', 'manager'].includes(role)
        );
      
      setUserRoles(validRoles);
      
      // جلب الصلاحيات بناء على الأدوار
      await fetchUserPermissions(validRoles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
      setUserPermissions([]);
    }
  };

  // جلب صلاحيات المستخدم
  const fetchUserPermissions = async (roles: UserRole[]) => {
    if (roles.length === 0) {
      setUserPermissions([]);
      return;
    }

    try {
      // استخدام JOIN مع جدول الصلاحيات للحصول على اسماء الصلاحيات
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permissions!inner (
            name
          )
        `)
        .in('role', roles);

      if (error) {
        console.error('Role permissions query error:', error);
        setUserPermissions([]);
        return;
      }

      const permissions = data?.map(item => item.permissions.name).filter(Boolean) || [];
      setUserPermissions([...new Set(permissions)]);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setUserPermissions([]);
    }
  };

  // جلب ملف المستخدم
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // التحقق من وجود دور معين
  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  // التحقق من وجود صلاحية معينة (async)
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('has_permission', {
        _user_id: user.id,
        _permission_name: permission
      });

      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }
      return data || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // التحقق من وجود صلاحية معينة (sync)
  const hasPermissionSync = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  // تسجيل الخروج
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setUserProfile(null);
      setUserPermissions([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // إعداد مستمع تغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // جلب البيانات الإضافية للمستخدم بشكل متزامن
          fetchUserRoles(session.user.id);
          fetchUserProfile(session.user.id);
        } else {
          setUserRoles([]);
          setUserProfile(null);
          setUserPermissions([]);
        }
        
        setLoading(false);
      }
    );

    // التحقق من الجلسة الحالية
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await Promise.all([
            fetchUserRoles(session.user.id),
            fetchUserProfile(session.user.id)
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    userRoles,
    userProfile,
    signOut,
    hasRole,
    hasPermission,
    hasPermissionSync,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
