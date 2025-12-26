import { User, BackgroundInfo } from '../types/auth';
import logger from '../utils/logger';

// AuthService to handle authentication logic
class AuthService {
  // Signup method that collects background information
  async signup(
    email: string,
    password: string,
    name: string,
    backgroundInfo?: BackgroundInfo
  ): Promise<{ user: User; error?: string }> {
    try {
      logger.info('Starting user signup process', { email, name }, 'unknown');

      // Call the FastAPI backend for signup
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          backgroundInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to create account');
      }

      // Store the session token if available
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      logger.info('User signed up successfully', { userId: data.user.id, email }, data.user.id);
      return { user: data.user };
    } catch (error) {
      logger.error('Signup error occurred', { error, email }, 'unknown');
      return {
        user: null,
        error: error.message || 'Failed to create account'
      };
    }
  }

  // Login method for different providers
  async login(email: string, password: string): Promise<{ user: User; error?: string }> {
    try {
      logger.info('Starting user login process', { email }, 'unknown');

      // Call the FastAPI backend for login
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to login');
      }

      // Store the session token if available
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      logger.info('User logged in successfully', { userId: data.user.id, email }, data.user.id);
      return { user: data.user };
    } catch (error) {
      logger.error('Login error occurred', { error, email }, 'unknown');
      return {
        user: null,
        error: error.message || 'Failed to login'
      };
    }
  }

  // Google OAuth login
  async loginWithGoogle(): Promise<{ user: User; error?: string }> {
    try {
      // For OAuth, we need to redirect to the FastAPI OAuth endpoint
      // This will handle the OAuth flow and redirect back
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      window.location.href = `${backendUrl}/api/auth/oauth/google`; // FastAPI Google OAuth endpoint
      return { user: null }; // This won't be reached due to redirect
    } catch (error) {
      console.error('Google login error:', error);
      return {
        user: null,
        error: error.message || 'Failed to login with Google'
      };
    }
  }

  // GitHub OAuth login
  async loginWithGitHub(): Promise<{ user: User; error?: string }> {
    try {
      // For OAuth, we need to redirect to the FastAPI OAuth endpoint
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      window.location.href = `${backendUrl}/api/auth/oauth/github`; // FastAPI GitHub OAuth endpoint
      return { user: null }; // This won't be reached due to redirect
    } catch (error) {
      console.error('GitHub login error:', error);
      return {
        user: null,
        error: error.message || 'Failed to login with GitHub'
      };
    }
  }

  // Update user background information
  async updateBackgroundInfo(userId: string, backgroundInfo: BackgroundInfo): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Updating background info for user', { userId, backgroundInfo }, userId);

      // Call the FastAPI backend to update the user's background info
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backgroundInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update background information');
      }

      const data = await response.json();
      logger.info('Background info updated successfully', { userId }, userId);
      return { success: true };
    } catch (error) {
      logger.error('Update background info error occurred', { error, userId }, userId);
      return {
        success: false,
        error: error.message || 'Failed to update background information'
      };
    }
  }

  // Allow OAuth users to set a password when they first attempt to use password-based features
  async setPasswordForOAuthUser(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, we would update the user's account to enable password login
      // For now, we'll simulate the process
      logger.info('Setting password for OAuth user', { userId }, userId);

      // This is a placeholder implementation
      // In a real app, this would hash the password and associate it with the user's account
      // that was originally created via OAuth
      return { success: true };
    } catch (error) {
      logger.error('Set password for OAuth user error occurred', { error, userId }, userId);
      return {
        success: false,
        error: error.message || 'Failed to set password for OAuth user'
      };
    }
  }

  // Forgot password functionality
  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Initiating password reset for user', { email }, 'unknown');

      // Call the FastAPI backend to initiate password reset
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to initiate password reset');
      }

      const data = await response.json();
      logger.info('Password reset initiated successfully', { email }, 'unknown');
      return { success: true };
    } catch (error) {
      logger.error('Forgot password error occurred', { error, email }, 'unknown');
      return {
        success: false,
        error: error.message || 'Failed to initiate password reset'
      };
    }
  }

  // Reset password functionality
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Resetting password with token', { token: token.substring(0, 10) + '...' }, 'unknown');

      // Call the FastAPI backend to reset password
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }

      const data = await response.json();
      logger.info('Password reset successfully', {}, 'unknown');
      return { success: true };
    } catch (error) {
      logger.error('Reset password error occurred', { error }, 'unknown');
      return {
        success: false,
        error: error.message || 'Failed to reset password'
      };
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      // Call the FastAPI backend to get the current user session
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      // Call the FastAPI backend for logout
      const backendUrl = typeof process !== 'undefined' && process.env?.BACKEND_URL
        ? process.env.BACKEND_URL
        : 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      // Clear the local storage regardless of the logout API response
      localStorage.removeItem('auth_token');

      if (!response.ok) {
        const data = await response.json();
        console.error('Logout API error:', data.detail || data.error);
      } else {
        console.log('User logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('auth_token');
    }
  }

}

export default new AuthService();