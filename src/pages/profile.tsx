import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfileForm from '../components/auth/ProfileForm';

const ProfilePage: React.FC = () => {
  const { user, isLoading, refreshUser } = useAuth();

  if (isLoading) {
    return (
      <div className="container margin-vert--lg">
        <div className="auth-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container margin-vert--lg">
        <div className="auth-container">
          <h2 className="auth-title">Access Denied</h2>
          <p>Please log in to view your profile.</p>
          <a href="/Humanoid-robotics-book/login" className="auth-button">Log In</a>
        </div>
      </div>
    );
  }

  // Prepare initial data for the form
  const initialData = user && user.backgroundInfo ? {
    name: user.name,
    backgroundInfo: user.backgroundInfo
  } : {
    name: user.name,
    backgroundInfo: {
      softwareSkills: {
        python: 'beginner',
        ros: 'beginner',
        javascript: 'beginner',
        typescript: 'beginner',
      },
      hardwareExperience: {
        jetson: 'none',
        rtx: 'none',
        raspberryPi: 'none',
        arduino: 'none',
      },
      roboticsExperience: 'none',
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // Call the AuthService to update the user's profile
      // We need to update the backend endpoint to handle both name and backgroundInfo
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
          name: data.name,
          backgroundInfo: data.backgroundInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const result = await response.json();
      alert('Profile updated successfully!');

      // Refresh the user data to update the context
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('An error occurred while updating the profile.');
    }
  };

  return (
    <div className="container margin-vert--lg">
      <div className="auth-container">
        <h2 className="auth-title">Your Profile</h2>

        <div className="margin-bottom--lg">
          <h3>Account Information</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
        </div>

        <div className="margin-bottom--lg">
          <h3>Background Information</h3>
          <ProfileForm
            initialData={initialData as any}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;