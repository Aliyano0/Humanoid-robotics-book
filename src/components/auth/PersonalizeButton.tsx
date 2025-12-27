import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface PersonalizeButtonProps {
  moduleId?: string;
  onPersonalize?: (personalizedContent: string) => void;
}

const PersonalizeButton: React.FC<PersonalizeButtonProps> = ({ moduleId, onPersonalize }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handlePersonalize = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/Humanoid-robotics-book/login';
      return;
    }

    if (!user || !user.backgroundInfo) {
      // Show prompt to collect background info if not available
      setShowPrompt(true);
      return;
    }

    setIsPersonalizing(true);

    try {
      // In a real implementation, we would call the personalization API
      // For now, we'll simulate the personalization process
      console.log('Personalizing content for user:', user);
      console.log('User background info:', user.backgroundInfo);

      // This is a placeholder for the personalization logic
      // In a real app, we would send the content to be personalized
      if (onPersonalize) {
        // Simulate personalized content based on user background
        const difficulty = user.backgroundInfo?.personalizationSettings?.difficultyPreference || 'intermediate';
        onPersonalize(`Content personalized for ${difficulty} level user`);
      }
    } catch (error) {
      console.error('Personalization error:', error);
    } finally {
      setIsPersonalizing(false);
    }
  };

  if (showPrompt) {
    return (
      <div className="auth-container">
        <h3 className="auth-title">Help Us Personalize Your Experience</h3>
        <p className="text-center mb-4">Please complete your background information to get personalized content.</p>

        <div className="flex space-x-2">
          <button
            className="auth-button flex-1"
            onClick={() => {
              // Redirect to profile page to update background info
              window.location.href = '/Humanoid-robotics-book/profile';
            }}
          >
            Update Profile
          </button>
          <button
            className="auth-button button--secondary flex-1"
            onClick={() => setShowPrompt(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handlePersonalize}
      disabled={isLoading || isPersonalizing}
      className="personalize-button"
    >
      {isPersonalizing ? 'Personalizing...' : 'Personalize Content'}
    </button>
  );
};

export default PersonalizeButton;