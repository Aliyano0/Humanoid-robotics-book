# Authentication System Implementation

This document provides an overview of the authentication system implemented using Better-Auth in the Docusaurus website.

## Overview

The authentication system provides secure user registration, login, and content personalization features for the Physical AI & Humanoid Robotics textbook site. It supports multiple authentication methods and adapts content based on user background information.

## Features

### Authentication Methods
- Email/password authentication
- OAuth with Google and GitHub

### User Registration
- Multi-step signup process (Account creation + Background information)
- Collection of user background information (software skills, hardware experience)
- Secure password storage with validation

### Content Personalization
- Adaptive content based on user's skill level
- Personalize button on chapter pages
- Conditional rendering based on user profile

### Security Features
- CSRF protection
- Session management with 30-day timeout
- Input validation and sanitization
- WCAG-compliant forms

## Architecture

### Frontend Components
- `LoginForm`: Handles email/password and OAuth login
- `SignupForm`: Multi-step registration with background collection
- `PersonalizeButton`: Triggers content personalization
- `ProfileForm`: Updates user profile and background info

### Services
- `AuthService`: Core authentication logic
- `PersonalizationService`: Content adaptation logic
- `ErrorHandler`: User-friendly error handling
- `Logger`: Authentication event logging

### Hooks
- `useAuth`: Authentication state management
- `usePersonalize`: Personalization logic

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Personalization
- `POST /api/auth/personalize` - Adapt content based on user profile

## Environment Variables

```env
# Better-Auth Configuration
AUTH_SECRET=your-super-secret-auth-key-here-replace-with-secure-value
DATABASE_URL=your-postgresql-connection-string

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

```

## Setup

1. Install dependencies:
```bash
npm install better-auth react-hook-form @hookform/resolvers zod
```

2. Set up environment variables as shown above

3. The authentication system is integrated with Docusaurus and will work with the existing routing and navigation

## Testing

The authentication system has been designed to meet a 95%+ success rate with 10 different user accounts. All authentication flows have been tested for functionality and accessibility compliance.

## Security Considerations

- All authentication forms are WCAG compliant
- Passwords must meet complexity requirements
- CSRF protection is enabled
- Input validation is performed on both client and server
- Sessions expire after 30 days
