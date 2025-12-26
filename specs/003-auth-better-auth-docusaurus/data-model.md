# Data Model: Authentication System Using Better-Auth in Docusaurus Website

## User Profile Entity
**Description**: Represents a registered user with authentication credentials and background information

**Fields**:
- `id` (string): Unique identifier for the user
- `email` (string): User's email address (unique, required)
- `name` (string): User's display name
- `image` (string, optional): Profile image URL
- `createdAt` (Date): Account creation timestamp
- `updatedAt` (Date): Last update timestamp
- `emailVerified` (Date, optional): Email verification timestamp
- `backgroundInfo` (object): User's background information
  - `softwareSkills` (object): Experience levels in various software technologies
    - `python` (string): "beginner", "intermediate", "advanced"
    - `ros` (string): "beginner", "intermediate", "advanced"
    - `javascript` (string): "beginner", "intermediate", "advanced"
    - `typescript` (string): "beginner", "intermediate", "advanced"
  - `hardwareExperience` (object): Experience with hardware platforms
    - `jetson` (string): "none", "beginner", "intermediate", "advanced"
    - `rtx` (string): "none", "beginner", "intermediate", "advanced"
    - `raspberryPi` (string): "none", "beginner", "intermediate", "advanced"
    - `arduino` (string): "none", "beginner", "intermediate", "advanced"
  - `roboticsExperience` (string): "none", "beginner", "intermediate", "advanced"
- `personalizationSettings` (object): Preferences for content adaptation
  - `difficultyPreference` (string): "beginner", "intermediate", "advanced"
  - `contentFormatPreference` (string): "text", "visual", "interactive"
  - `personalizationEnabled` (boolean): Whether content personalization is active

**Validation Rules**:
- Email must be valid and unique
- Name must be 1-100 characters
- Background information fields must be from allowed enum values
- User must provide at least some background information after registration

## Authentication Session Entity
**Description**: Represents a user's authenticated state with security tokens and expiration

**Fields**:
- `id` (string): Unique session identifier
- `userId` (string): Reference to the user
- `expiresAt` (Date): Session expiration timestamp
- `createdAt` (Date): Session creation timestamp
- `updatedAt` (Date): Last update timestamp
- `ipAddress` (string, optional): IP address of session creator
- `userAgent` (string, optional): Browser/device information

**Validation Rules**:
- Session must be linked to a valid user
- Session must not be expired
- Maximum of 5 active sessions per user

## OAuth Account Entity
**Description**: Stores OAuth provider information for users who register via Google/GitHub

**Fields**:
- `id` (string): Unique identifier for the OAuth account
- `userId` (string): Reference to the user
- `providerId` (string): Provider identifier (e.g., "google", "github")
- `providerAccountId` (string): Account ID from the provider
- `accessToken` (string, optional): OAuth access token
- `refreshToken` (string, optional): OAuth refresh token
- `expiresAt` (Date, optional): Token expiration time
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Last update timestamp

**Validation Rules**:
- Must be linked to a valid user
- Provider and providerAccountId combination must be unique

## Personalization Preference Entity
**Description**: Stores user preferences for content personalization

**Fields**:
- `id` (string): Unique identifier for the preference
- `userId` (string): Reference to the user
- `moduleId` (string): ID of the module/chapter the preference applies to
- `preferredComplexity` (string): "simplified", "balanced", "advanced"
- `preferredExamples` (string): "software-focused", "hardware-focused", "balanced"
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Last update timestamp

**Validation Rules**:
- Must be linked to a valid user
- Module ID must be valid
- Complexity and example preferences must be from allowed values