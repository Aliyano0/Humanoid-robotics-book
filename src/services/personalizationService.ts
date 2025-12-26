import { BackgroundInfo, PersonalizationSettings } from '../types/auth';

interface PersonalizeContentRequest {
  moduleId: string;
  content: string;
  backgroundInfo?: BackgroundInfo;
  personalizationSettings?: PersonalizationSettings;
}

interface PersonalizeContentResponse {
  content: string;
  metadata: {
    appliedPersonalization: string[];
    originalComplexity: string;
    adaptedComplexity: string;
  };
}

class PersonalizationService {
  /**
   * Personalizes content based on user's background information
   */
  async personalizeContent(request: PersonalizeContentRequest): Promise<PersonalizeContentResponse> {
    const { content, backgroundInfo, personalizationSettings } = request;

    // Determine the user's experience level based on background info
    let userLevel = 'intermediate'; // default
    if (personalizationSettings?.difficultyPreference) {
      userLevel = personalizationSettings.difficultyPreference;
    } else if (backgroundInfo) {
      // Calculate an overall level based on software skills
      const { softwareSkills } = backgroundInfo;
      const levels = Object.values(softwareSkills).map(skill => {
        switch (skill) {
          case 'beginner': return 1;
          case 'intermediate': return 2;
          case 'advanced': return 3;
          default: return 0;
        }
      });

      const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      if (avgLevel < 1.5) userLevel = 'beginner';
      else if (avgLevel > 2.5) userLevel = 'advanced';
    }

    // Apply personalization based on user level
    let personalizedContent = content;
    const appliedPersonalization: string[] = [];

    switch (userLevel) {
      case 'beginner':
        // Add explanations and simplify complex concepts
        personalizedContent = this.adaptContentForBeginner(content);
        appliedPersonalization.push('simplified explanations', 'added examples');
        break;
      case 'advanced':
        // Add more depth and advanced concepts
        personalizedContent = this.adaptContentForAdvanced(content);
        appliedPersonalization.push('added depth', 'advanced concepts');
        break;
      case 'intermediate':
      default:
        // Keep content as is for intermediate users
        appliedPersonalization.push('standard content');
        break;
    }

    return {
      content: personalizedContent,
      metadata: {
        appliedPersonalization,
        originalComplexity: 'mixed',
        adaptedComplexity: userLevel
      }
    };
  }

  /**
   * Adapts content for beginner-level users
   */
  private adaptContentForBeginner(content: string): string {
    // In a real implementation, this would use more sophisticated text processing
    // For now, we'll add some beginner-friendly annotations
    let adapted = content;

    // Add more explanations for technical terms
    adapted = adapted.replace(/\b(AI|API|ML|DL)\b/g, (match) => {
      const fullForm = match === 'AI' ? 'Artificial Intelligence' :
                      match === 'API' ? 'Application Programming Interface' :
                      match === 'ML' ? 'Machine Learning' : 'Deep Learning';
      return `${match} (${fullForm})`;
    });

    // Add more examples and simpler language
    adapted = adapted.replace(/\./g, '. For example: ');

    return adapted;
  }

  /**
   * Adapts content for advanced-level users
   */
  private adaptContentForAdvanced(content: string): string {
    // In a real implementation, this would use more sophisticated text processing
    // For now, we'll add some advanced annotations
    let adapted = content;

    // Add more technical depth
    adapted = adapted.replace(/concept/gi, 'advanced concept');
    adapted = adapted.replace(/method/gi, 'advanced method');

    return adapted;
  }

  /**
   * Gets content adaptation suggestions based on user profile
   */
  async getContentSuggestions(userId: string, moduleId: string, content: string): Promise<string[]> {
    // In a real implementation, this would analyze the content and user profile
    // to provide specific adaptation suggestions
    return [
      `Consider adapting this content for user ${userId} based on their background`,
      `Module ${moduleId} could be enhanced with more examples for beginners`,
      `Add more advanced topics for users with ROS experience`
    ];
  }
}

export default new PersonalizationService();