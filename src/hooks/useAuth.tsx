
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRoles: string[];
  userProfile: any;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => Promise<boolean>;
  hasPermissionSync: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
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
      
      const roles = data?.map(r => r.role) || [];
      setUserRoles(roles);
      
      // جلب الصلاحيات بناء على الأدوار
      await fetchUserPermissions(roles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
      setUserPermissions([]);
    }
  };

  // جلب صلاحيات المستخدم
  const fetchUserPermissions = async (roles: string[]) => {
    if (roles.length === 0) {
      setUserPermissions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission')
        .in('role', roles);

      if (error) throw error;
      
      const permissions = data?.map(p => p.permission) || [];
      setUserPermissions([...new Set(permissions)]); // إزالة التكرار
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
  const hasRole = (role: string): boolean => {
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
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // جلب البيانات الإضافية للمستخدم
          setTimeout(() => {
            fetchUserRoles(session.user.id);
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserRoles([]);
          setUserProfile(null);
          setUserPermissions([]);
        }
        
        setLoading(false);
      }
    );

    // التحقق من الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

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
