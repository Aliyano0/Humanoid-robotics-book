import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import PersonalizationService from '../services/personalizationService';
import { PersonalizeContentRequest, PersonalizeContentResponse } from '../services/personalizationService';

interface UsePersonalizeReturn {
  personalizeContent: (request: PersonalizeContentRequest) => Promise<PersonalizeContentResponse>;
  isPersonalizing: boolean;
  error: string | null;
}

export const usePersonalize = (): UsePersonalizeReturn => {
  const { user } = useAuth();
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personalizeContent = useCallback(async (request: PersonalizeContentRequest): Promise<PersonalizeContentResponse> => {
    setIsPersonalizing(true);
    setError(null);

    try {
      // Include user's background info in the personalization request if available
      const personalizationRequest: PersonalizeContentRequest = {
        ...request,
        backgroundInfo: user?.backgroundInfo,
        personalizationSettings: user?.personalizationSettings,
      };

      const result = await PersonalizationService.personalizeContent(personalizationRequest);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to personalize content';
      setError(errorMessage);
      console.error('Personalization error:', err);

      // Return original content with error metadata
      return {
        content: request.content,
        metadata: {
          appliedPersonalization: [],
          originalComplexity: 'unknown',
          adaptedComplexity: 'unknown'
        }
      };
    } finally {
      setIsPersonalizing(false);
    }
  }, [user]);

  return {
    personalizeContent,
    isPersonalizing,
    error,
  };
};