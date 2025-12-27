// User interface based on Better-Auth and our requirements
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Session interface
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Software skills interface
export interface SoftwareSkills {
  python: 'beginner' | 'intermediate' | 'advanced';
  ros: 'beginner' | 'intermediate' | 'advanced';
  javascript: 'beginner' | 'intermediate' | 'advanced';
  typescript: 'beginner' | 'intermediate' | 'advanced';
}

// Hardware experience interface
export interface HardwareExperience {
  jetson: 'none' | 'beginner' | 'intermediate' | 'advanced';
  rtx: 'none' | 'beginner' | 'intermediate' | 'advanced';
  raspberryPi: 'none' | 'beginner' | 'intermediate' | 'advanced';
  arduino: 'none' | 'beginner' | 'intermediate' | 'advanced';
}

// Background information interface
export interface BackgroundInfo {
  softwareSkills: SoftwareSkills;
  hardwareExperience: HardwareExperience;
  roboticsExperience: 'none' | 'beginner' | 'intermediate' | 'advanced';
}

// Personalization settings interface
export interface PersonalizationSettings {
  difficultyPreference: 'beginner' | 'intermediate' | 'advanced';
  contentFormatPreference: 'text' | 'visual' | 'interactive';
  personalizationEnabled: boolean;
}

// User profile interface combining user data with additional fields
export interface UserProfile {
  user: User;
  backgroundInfo?: BackgroundInfo;
  personalizationSettings?: PersonalizationSettings;
}

// Authentication context interface
export interface AuthContext {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}