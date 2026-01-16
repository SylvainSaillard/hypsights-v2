import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

interface SignupResult {
  user: User | null;
  needsEmailConfirmation: boolean;
  message: string;
}

type UserRole = 'user' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: UserRole;
  isAdmin: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signup: (email?: string, password?: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('user');

  // Fetch user role from users_metadata with timeout
  const fetchUserRole = async (userId: string) => {
    console.log('[AuthContext] Fetching user role for:', userId);
    
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout fetching user role')), 5000);
    });
    
    try {
      const queryPromise = supabase
        .from('users_metadata')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (!result) {
        console.warn('[AuthContext] Timeout - defaulting to user role');
        setUserRole('user');
        return;
      }
      
      const { data, error } = result as { data: any; error: any };
      
      if (error) {
        console.error('[AuthContext] Error fetching user role:', error);
        setUserRole('user');
        return;
      }
      
      console.log('[AuthContext] User role fetched:', data?.role);
      setUserRole(data?.role || 'user');
    } catch (err) {
      console.error('[AuthContext] Exception fetching user role:', err);
      setUserRole('user');
    }
  };


  useEffect(() => {
    console.log('[AuthContext] Initializing auth...');
    setIsLoading(true);
    
    const getSession = async () => {
      try {
        console.log('[AuthContext] Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          throw error;
        }

        console.log('[AuthContext] Session retrieved:', session ? 'Found' : 'Null');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('[AuthContext] Error during initialization:', error);
      } finally {
        console.log('[AuthContext] Initialization complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(`[AuthContext] Auth state change: ${event}`);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole('user');
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    // Don't set global isLoading to true, as it unmounts the App component
    // Let individual components handle their loading state
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    // The onAuthStateChange listener will handle setting user and session
  };

  const signup = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required for signup.');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          // Add any additional user metadata here if needed
        }
      }
    });
    
    // console.log('Signup response:', { data, error });

    if (error) {
      throw error;
    }

    // console.log('Supabase signup data:', data); // Log data for debugging
    
    // Check if user needs to confirm email
    if (data.user && !data.session) {
      // Email confirmation is required
      return {
        user: data.user,
        needsEmailConfirmation: true,
        message: 'Please check your email and click the confirmation link to activate your account.'
      };
    }

    // If we reach here, either email confirmation is disabled or there was an issue
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      // This can happen if "Confirm email" is ON but the email is already in use (but not confirmed)
      throw new Error('This email is already registered but not confirmed. Please check your email for the confirmation link.');
    }

    return {
      user: data.user,
      needsEmailConfirmation: false,
      message: 'Account created successfully!'
    };
  };


  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // The onAuthStateChange listener will handle setting user to null and session to null
  };

  const isAdmin = userRole === 'admin';

  const value = {
    user,
    session,
    isLoading,
    userRole,
    isAdmin,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
