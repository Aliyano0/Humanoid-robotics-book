import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AuthService from '../../services/authService';

// Define the schema for the signup form using Zod
const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(254, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z0-9\s\-_.]{1,100}$/,
      'Name contains invalid characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const [step, setStep] = useState<number>(1); // Step 1: Account, Step 2: Background
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the AuthService to create the account
      const result = await AuthService.signup(data.email, data.password, data.name);

      if (result.error) {
        setError(result.error);
      } else {
        // Signup successful
        setStep(2); // Move to background information step
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundSubmit = async () => {
    // Collect background information from the form
    const pythonExperience = document.querySelector('input[name="python"]:checked') as HTMLInputElement;
    const rosExperience = document.querySelector('input[name="ros"]:checked') as HTMLInputElement;
    const roboticsExperience = document.querySelector('input[name="robotics"]:checked') as HTMLInputElement;

    const jetsonChecked = (document.querySelector('input[name="jetson"]') as HTMLInputElement)?.checked;
    const rtxChecked = (document.querySelector('input[name="rtx"]') as HTMLInputElement)?.checked;
    const raspberryPiChecked = (document.querySelector('input[name="raspberry-pi"]') as HTMLInputElement)?.checked;
    const arduinoChecked = (document.querySelector('input[name="arduino"]') as HTMLInputElement)?.checked;

    const backgroundInfo = {
      python: pythonExperience?.value || null,
      ros: rosExperience?.value || null,
      robotics: roboticsExperience?.value || null,
      hardware: {
        jetson: jetsonChecked || false,
        rtx: rtxChecked || false,
        'raspberry-pi': raspberryPiChecked || false,
        arduino: arduinoChecked || false
      }
    };

    try {
      // Get the current user to get their ID
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        // Update the user's background information
        await AuthService.updateBackgroundInfo(currentUser.id, backgroundInfo);
      }
    } catch (error) {
      console.error('Error saving background info:', error);
      // We'll still redirect even if background info saving fails
    }

    // Redirect to home page after signup
    window.location.href = '/Humanoid-robotics-book/';
  };

  // Render different content based on the current step
  if (step === 1) {
    return (
      <div className="auth-container">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div>
            <label htmlFor="name" className="auth-label">Name</label>
            <input
              id="name"
              type="text"
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`auth-input ${errors.name ? 'border-red-500' : ''}`}
              {...register('name')}
            />
            {errors.name && <div id="name-error" className="auth-error">{errors.name.message}</div>}
          </div>

          <div>
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`auth-input ${errors.email ? 'border-red-500' : ''}`}
              {...register('email')}
            />
            {errors.email && <div id="email-error" className="auth-error">{errors.email.message}</div>}
          </div>

          <div>
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              type="password"
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`auth-input ${errors.password ? 'border-red-500' : ''}`}
              {...register('password')}
            />
            {errors.password && <div id="password-error" className="auth-error">{errors.password.message}</div>}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <div className="signup-login-toggle">
          Already have an account? <a href="/Humanoid-robotics-book/login" className="auth-link">Log in</a>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="auth-container">
        <h2 className="auth-title">Tell Us About Your Background</h2>
        <p className="text-center mb-4">This helps us personalize your learning experience</p>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleBackgroundSubmit();
        }} className="auth-form">
          <div className="background-info-grid">
            <div>
              <label className="block mb-1">Python Experience</label>
              <div className="skill-level-selector">
                <label className="skill-level-option">
                  <input type="radio" name="python" value="beginner" className="mr-1" /> Beginner
                </label>
                <label className="skill-level-option">
                  <input type="radio" name="python" value="intermediate" className="mr-1" /> Intermediate
                </label>
                <label className="skill-level-option">
                  <input type="radio" name="python" value="advanced" className="mr-1" /> Advanced
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-1">ROS Experience</label>
              <div className="skill-level-selector">
                <label className="skill-level-option">
                  <input type="radio" name="ros" value="beginner" className="mr-1" /> Beginner
                </label>
                <label className="skill-level-option">
                  <input type="radio" name="ros" value="intermediate" className="mr-1" /> Intermediate
                </label>
                <label className="skill-level-option">
                  <input type="radio" name="ros" value="advanced" className="mr-1" /> Advanced
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-1">Hardware Access</label>
              <div className="skill-level-selector">
                <label className="skill-level-option">
                  <input type="checkbox" name="jetson" className="mr-1" /> Jetson
                </label>
                <label className="skill-level-option">
                  <input type="checkbox" name="rtx" className="mr-1" /> RTX
                </label>
                <label className="skill-level-option">
                  <input type="checkbox" name="raspberry-pi" className="mr-1" /> Raspberry Pi
                </label>
                <label className="skill-level-option">
                  <input type="checkbox" name="arduino" className="mr-1" /> Arduino
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-1">Robotics Experience</label>
              <div className="skill-level-selector">
                <label className="skill-level-option">
                  <input type="radio" name="robotics" value="none" className="mr-1" /> None
                </label>
                <label className="skill-level-option">
                  <input type="radio" name="robotics" value="beginner" className="mr-1" /> Beginner
                </label>
                <label className="skill-level-option">
                  <input type="radio" name="robotics" value="intermediate" className="mr-1" /> Intermediate
                </label>
                <label className="skill-level-option">
                  <input type="radio" name="robotics" value="advanced" className="mr-1" /> Advanced
                </label>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(1)} // Go back to account step
            className="auth-button mr-2"
          >
            Back
          </button>

          <button
            type="submit"
            className="auth-button"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }


  return null; // Should not reach here
};

export default SignupForm;