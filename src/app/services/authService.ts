// Authentication service using Supabase Auth
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1cfc035a`;

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private sessionRestored = false;
  private restoringSession = false; // Prevent multiple concurrent restores

  constructor() {
    // Start restoring session (async, but don't wait)
    this.restoreSession();
  }

  private restoreSession(): void {
    console.log('🔄 Restoring session from localStorage...');
    
    const savedUser = localStorage.getItem('rooted-user');
    const savedToken = localStorage.getItem('rooted-access-token');
    
    if (savedUser && savedToken) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.accessToken = savedToken;
        
        // VALIDATION: Check if token is expired or invalid
        try {
          const parts = savedToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const expiresAt = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            
            if (expiresAt < now) {
              console.log('ℹ️ Stored token is expired - clearing session');
              this.clearSession();
              this.sessionRestored = true;
              return;
            }
            
            console.log('✅ Token expires at:', new Date(expiresAt).toISOString());
            console.log('✅ Token is valid for:', Math.round((expiresAt - now) / 1000 / 60), 'more minutes');
          }
        } catch (e) {
          console.log('ℹ️ Could not validate token - clearing session');
          this.clearSession();
          this.sessionRestored = true;
          return;
        }
        
        console.log('✅ Session restored:', this.currentUser.email);
      } catch (error) {
        console.error('Error parsing saved session:', error);
        this.clearSession();
      }
    } else {
      console.log('ℹ️ No saved session found');
    }
    
    this.sessionRestored = true;
  }

  async waitForSessionRestore(): Promise<void> {
    // Wait for session restoration to complete
    while (!this.sessionRestored) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private saveSession(user: User, token: string) {
    console.log('💾 Saving session for user:', user.email);
    console.log('💾 Token length:', token.length);
    console.log('💾 Token preview:', token.substring(0, 20) + '...' + token.substring(token.length - 10));
    
    // Set instance variables FIRST
    this.currentUser = user;
    this.accessToken = token;
    this.sessionRestored = true; // Mark session as restored when saving
    
    // Then save to localStorage
    try {
      localStorage.setItem('rooted-user', JSON.stringify(user));
      localStorage.setItem('rooted-access-token', token);
      console.log('✅ Session saved to localStorage successfully');
    } catch (e) {
      console.error('❌ Failed to save session to localStorage:', e);
    }
    
    // Verify the save worked
    const savedUser = localStorage.getItem('rooted-user');
    const savedToken = localStorage.getItem('rooted-access-token');
    console.log('✅ Verification - localStorage has user:', !!savedUser);
    console.log('✅ Verification - localStorage has token:', !!savedToken);
    
    // Verify instance state
    console.log('🔍 Auth state after save:', {
      hasCurrentUser: !!this.currentUser,
      currentUserEmail: this.currentUser?.email,
      hasAccessToken: !!this.accessToken,
      accessTokenLength: this.accessToken?.length || 0,
      sessionRestored: this.sessionRestored,
      isAuthenticated: this.isAuthenticated()
    });
  }

  private clearSession() {
    console.log('🧹 Session cleared');
    this.currentUser = null;
    this.accessToken = null;
    localStorage.removeItem('rooted-user');
    localStorage.removeItem('rooted-access-token');
    // Also clear any legacy bookmark data
    localStorage.removeItem('rooted-bookmarks');
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('✅ Signup successful:', data.user.email);
      
      // After signup, sign in automatically
      return await this.signIn(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signin failed');
      }

      this.saveSession(data.user, data.session.access_token);
      console.log('✅ Signin successful:', data.user.email);
      console.log('✅ Access token saved:', data.session.access_token.substring(0, 30) + '...');
      
      return data.user;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${API_BASE}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
      }
      
      this.clearSession();
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('Signout error:', error);
      // Clear session anyway
      this.clearSession();
    }
  }

  getCurrentUser(): User | null {
    // Double-check localStorage in case memory was cleared but localStorage wasn't
    if (!this.currentUser && this.sessionRestored) {
      const savedUser = localStorage.getItem('rooted-user');
      const savedToken = localStorage.getItem('rooted-access-token');
      if (savedUser && savedToken) {
        try {
          console.warn('⚠️ getCurrentUser: Memory cleared but localStorage has session! Restoring...');
          this.currentUser = JSON.parse(savedUser);
          this.accessToken = savedToken;
        } catch (e) {
          console.error('❌ Failed to restore from localStorage:', e);
        }
      }
    }
    return this.currentUser;
  }

  getAccessToken(): string | null {
    // Double-check localStorage in case memory was cleared but localStorage wasn't
    if (!this.accessToken && this.sessionRestored) {
      const savedToken = localStorage.getItem('rooted-access-token');
      const savedUser = localStorage.getItem('rooted-user');
      if (savedToken && savedUser) {
        try {
          console.warn('⚠️ getAccessToken: Memory cleared but localStorage has session! Restoring...');
          this.accessToken = savedToken;
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          console.error('❌ Failed to restore from localStorage:', e);
        }
      }
    }
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    // Use the getters which check localStorage
    return this.getCurrentUser() !== null && this.getAccessToken() !== null;
  }
}

export const authService = new AuthService();