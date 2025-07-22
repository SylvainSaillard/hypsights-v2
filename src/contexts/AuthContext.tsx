import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signup: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

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
            async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else {
          setIsPasswordRecovery(false);
        }
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
      // You can add options here, like redirect URL for email confirmation
      // options: {
      //   emailRedirectTo: window.location.origin + '/login', // Or wherever you want them to go after confirming
      // }
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    console.log('Supabase signup data:', data); // Log data for debugging
    
    // if (data.user && data.user.identities && data.user.identities.length === 0) {
    //   // This can happen if "Confirm email" is ON but the email is already in use (but not confirmed)
    //   // Or if an unhandled error occurred where user is null but no error was thrown by signUp
    //   setIsLoading(false);
    //   throw new Error('Signup failed. The email might already be in use or an unknown error occurred.');
    // }

    // If "Confirm email" is ON, data.user will exist but data.session will be null.
    // The onAuthStateChange listener will eventually update user state if they confirm.
    // If "Confirm email" is OFF, data.session will be populated, and onAuthStateChange will fire.
    setIsLoading(false); // Set loading to false here as onAuthStateChange might not fire immediately if email confirmation is needed
    return; // Let the UI decide what message to show based on data.user and data.session
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
    isPasswordRecovery,
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
