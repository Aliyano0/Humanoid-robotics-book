import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AuthService from '../../services/authService';

// Define the schema for the login form using Zod
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(254, 'Email is too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [emailForReset, setEmailForReset] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.login(data.email, data.password);
      if (result.error) {
        setError(result.error);
      } else {
        // Login successful
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        // In a real app, we would redirect or update the UI
        window.location.href = '/Humanoid-robotics-book/';
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await AuthService.loginWithGoogle();
      if (result.error) {
        setError(result.error);
      } else {
        // Login successful
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        window.location.href = '/Humanoid-robotics-book/';
      }
    } catch (err) {
      setError('Failed to login with Google. Please try again.');
      console.error('Google login error:', err);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const result = await AuthService.loginWithGitHub();
      if (result.error) {
        setError(result.error);
      } else {
        // Login successful
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        window.location.href = '/Humanoid-robotics-book/';
      }
    } catch (err) {
      setError('Failed to login with GitHub. Please try again.');
      console.error('GitHub login error:', err);
    }
  };

  // Forgot password functionality
  const handleForgotPassword = async () => {
    if (!emailForReset) {
      setError('Please enter your email address');
      return;
    }

    setResetLoading(true);
    setError(null);

    try {
      const result = await AuthService.forgotPassword(emailForReset);
      if (result.error) {
        setError(result.error);
      } else {
        setResetSuccess(true);
      }
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    setShowForgotPassword(false);
    setResetSuccess(false);
    setEmailForReset('');
    setError(null);
  };

  return (
    <div className="auth-container">
      {!showForgotPassword ? (
        // Login form
        <>
          <h2 className="auth-title">Log In to Your Account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div>
              <label htmlFor="email" className="block mb-1">Email</label>
              <input
                id="email"
                type="email"
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`auth-input ${errors.email ? 'border-red-500' : ''}`}
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <div id="email-error" className="auth-error">{errors.email.message}</div>}
            </div>

            <div>
              <label htmlFor="password" className="block mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`auth-input ${errors.password ? 'border-red-500' : ''}`}
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-sm"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <div id="password-error" className="auth-error">{errors.password.message}</div>}
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" disabled={isLoading} />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="auth-link text-sm"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="auth-button w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="oauth-buttons">
            <button
              type="button"
              className="oauth-button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                ></path>
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                ></path>
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                ></path>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              className="oauth-button"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.602-3.369-1.34-3.369-1.34-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="signup-login-toggle">
            Don't have an account? <a href="/Humanoid-robotics-book/signup" className="auth-link">Sign up</a>
          </div>
        </>
      ) : (
        // Forgot password form
        <>
          <h2 className="auth-title">Reset Your Password</h2>

          {resetSuccess ? (
            <div className="auth-success">
              <p>Password reset instructions have been sent to your email address.</p>
              <button
                type="button"
                className="auth-button mt-4"
                onClick={handleReturnToLogin}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }} className="auth-form">
              {error && <div className="auth-error">{error}</div>}

              <p className="mb-4">Enter your email address and we'll send you a link to reset your password.</p>

              <div>
                <label htmlFor="email-reset" className="block mb-1">Email</label>
                <input
                  id="email-reset"
                  type="email"
                  className="auth-input"
                  value={emailForReset}
                  onChange={(e) => setEmailForReset(e.target.value)}
                  disabled={resetLoading}
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                className="auth-button w-full mt-4"
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                className="auth-button mt-2 w-full"
                onClick={handleReturnToLogin}
                disabled={resetLoading}
              >
                Back to Login
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default LoginForm;