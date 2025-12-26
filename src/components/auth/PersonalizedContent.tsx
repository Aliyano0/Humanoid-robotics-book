import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePersonalize } from '../../hooks/usePersonalize';
import PersonalizeButton from './PersonalizeButton';

interface PersonalizedContentProps {
  moduleId: string;
  defaultContent: string;
  children?: React.ReactNode;
}

const PersonalizedContent: React.FC<PersonalizedContentProps> = ({
  moduleId,
  defaultContent,
  children
}) => {
  const { user, isAuthenticated } = useAuth();
  const { personalizeContent, isPersonalizing, error } = usePersonalize();
  const [personalizedContent, setPersonalizedContent] = useState<string>(defaultContent);
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);

  // When the component mounts, check if we should personalize the content
  useEffect(() => {
    const loadPersonalizedContent = async () => {
      if (isAuthenticated && user?.backgroundInfo) {
        try {
          const result = await personalizeContent({
            moduleId,
            content: defaultContent,
          });
          setPersonalizedContent(result.content);
          setIsContentLoaded(true);
        } catch (err) {
          console.error('Failed to load personalized content:', err);
          setPersonalizedContent(defaultContent);
        }
      } else {
        setPersonalizedContent(defaultContent);
      }
    };

    loadPersonalizedContent();
  }, [isAuthenticated, user, moduleId, defaultContent, personalizeContent]);

  const handleContentPersonalization = async () => {
    if (!isAuthenticated) {
      // If not authenticated, the PersonalizeButton will redirect to login
      return;
    }

    try {
      const result = await personalizeContent({
        moduleId,
        content: defaultContent,
      });
      setPersonalizedContent(result.content);
    } catch (err) {
      console.error('Personalization failed:', err);
    }
  };

  return (
    <div>
      <div className="personalize-header">
        <h2>Chapter Content</h2>
        {isAuthenticated && (
          <PersonalizeButton
            moduleId={moduleId}
            onPersonalize={handleContentPersonalization}
          />
        )}
      </div>

      {error && (
        <div className="alert alert--warning">
          {error}
        </div>
      )}

      {isPersonalizing && (
        <div className="loading">Personalizing content...</div>
      )}

      <div className="content">
        {children ? children : <div>{personalizedContent}</div>}
      </div>
    </div>
  );
};

export default PersonalizedContent;