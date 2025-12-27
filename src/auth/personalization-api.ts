import { auth } from './auth.config';
import PersonalizationService from '../services/personalizationService';
import { PersonalizeContentRequest } from '../services/personalizationService';

// In a real implementation with Better-Auth, we would extend the auth configuration
// with custom endpoints. For now, this serves as a placeholder for the API implementation.

/**
 * Personalization API endpoint handler
 * This would be integrated with Better-Auth's endpoint system
 */
export const handlePersonalizeRequest = async (req: any, res: any) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Verify user authentication (this would use Better-Auth's session verification)
    // const session = await auth.getSession(req);
    // if (!session) {
    //   res.status(401).json({ error: 'Unauthorized' });
    //   return;
    // }

    const { moduleId, content }: PersonalizeContentRequest = req.body;

    if (!moduleId || !content) {
      res.status(400).json({ error: 'moduleId and content are required' });
      return;
    }

    // Get user's background info (this would come from the user's profile in the database)
    // For now, we'll use a mock user profile
    const mockBackgroundInfo = {
      softwareSkills: {
        python: 'intermediate' as const,
        ros: 'beginner' as const,
        javascript: 'intermediate' as const,
        typescript: 'intermediate' as const,
      },
      hardwareExperience: {
        jetson: 'none' as const,
        rtx: 'beginner' as const,
        raspberryPi: 'intermediate' as const,
        arduino: 'advanced' as const,
      },
      roboticsExperience: 'intermediate' as const,
    };

    // Call the personalization service
    const result = await PersonalizationService.personalizeContent({
      moduleId,
      content,
      backgroundInfo: mockBackgroundInfo,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Personalization API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Note: In a real Better-Auth implementation, this endpoint would be registered
// with the auth configuration as a custom endpoint