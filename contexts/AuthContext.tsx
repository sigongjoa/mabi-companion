"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        // Check if user profile exists in public.users table, create if not
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error && error.code === 'PGRST116') { // No rows found
          // Create new user profile
          const username = session.user.user_metadata?.user_name || // GitHub
                         session.user.user_metadata?.full_name ||  // Google
                         session.user.user_metadata?.global_name || // Discord
                         session.user.email; // Fallback

          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              username: username,
              llmTokens: 0,
              rating: 0,
              feedbackCount: 0,
              following: [],
              qaAnswerCount: 0,
              bestAnswerCount: 0,
              representativeCharacterId: null,
            });
          if (insertError) {
            console.error('Error creating user profile:', insertError);
          }
        } else if (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};