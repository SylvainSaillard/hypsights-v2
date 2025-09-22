import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

interface SignupResult {
  user: User | null;
  needsEmailConfirmation: boolean;
  message: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signup: (email?: string, password?: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
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
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // The onAuthStateChange listener will handle setting user and session
    // setIsLoading(false); // onAuthStateChange will set loading to false
  };

  const signup = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required for signup.');
    }
    setIsLoading(true);
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

    if (error) {
      setIsLoading(false);
      throw error;
    }

    console.log('Supabase signup data:', data); // Log data for debugging
    
    // Check if user needs to confirm email
    if (data.user && !data.session) {
      // Email confirmation is required
      setIsLoading(false);
      return {
        user: data.user,
        needsEmailConfirmation: true,
        message: 'Please check your email and click the confirmation link to activate your account.'
      };
    }

    // If we reach here, either email confirmation is disabled or there was an issue
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      // This can happen if "Confirm email" is ON but the email is already in use (but not confirmed)
      setIsLoading(false);
      throw new Error('This email is already registered but not confirmed. Please check your email for the confirmation link.');
    }

    setIsLoading(false);
    return {
      user: data.user,
      needsEmailConfirmation: false,
      message: 'Account created successfully!'
    };
  };


  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // The onAuthStateChange listener will handle setting user to null and session to null
  };

  const value = {
    user,
    session,
    isLoading,
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
