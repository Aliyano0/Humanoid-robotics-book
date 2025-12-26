# Authentication API Documentation

This document describes the authentication API endpoints available in the Humanoid Blueprint application.

## Base URL

All API endpoints are relative to the application's base URL.

## Authentication Headers

Most endpoints require authentication. Include the following header in your requests:

```
Authorization: Bearer {token}
```

## Endpoints

### POST /api/auth/login

Authenticate a user with email/password or OAuth credentials.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "user_password",
  "provider": "email|google|github",
  "oauthToken": "oauth_token_if_applicable"
}
```

#### Response

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "image": "avatar_url",
    "emailVerified": "timestamp",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "session": {
    "id": "session_id",
    "userId": "user_id",
    "expiresAt": "timestamp",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "token": "authentication_token"
}
```

### POST /api/auth/signup

Register a new user account with background information.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "user_password",
  "name": "User Name",
  "backgroundInfo": {
    "softwareSkills": {
      "python": "beginner|intermediate|advanced",
      "ros": "beginner|intermediate|advanced",
      "javascript": "beginner|intermediate|advanced",
      "typescript": "beginner|intermediate|advanced"
    },
    "hardwareExperience": {
      "jetson": "none|beginner|intermediate|advanced",
      "rtx": "none|beginner|intermediate|advanced",
      "raspberryPi": "none|beginner|intermediate|advanced",
      "arduino": "none|beginner|intermediate|advanced"
    },
    "roboticsExperience": "none|beginner|intermediate|advanced"
  }
}
```

#### Response

```json
{
  "user": { ... },
  "session": { ... }
}
```


### GET /api/auth/me

Retrieve information about the authenticated user.

#### Response

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "image": "avatar_url",
  "emailVerified": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### GET /api/auth/profile

Retrieve user profile including background information and personalization settings.

#### Response

```json
{
  "user": { ... },
  "backgroundInfo": { ... },
  "personalizationSettings": {
    "difficultyPreference": "beginner|intermediate|advanced",
    "contentFormatPreference": "text|visual|interactive",
    "personalizationEnabled": true
  }
}
```

### PUT /api/auth/profile

Update user profile including background information.

#### Request Body

```json
{
  "user": { ... },
  "backgroundInfo": { ... },
  "personalizationSettings": { ... }
}
```

#### Response

```json
{
  "user": { ... },
  "backgroundInfo": { ... },
  "personalizationSettings": { ... }
}
```

### POST /api/auth/personalize

Retrieve content adapted to user's background and preferences.

#### Request Body

```json
{
  "moduleId": "module_id",
  "content": "original_content"
}
```

#### Response

```json
{
  "content": "personalized_content",
  "metadata": {
    "appliedPersonalization": ["list", "of", "changes"],
    "originalComplexity": "complexity_level",
    "adaptedComplexity": "complexity_level"
  }
}
```

## Error Responses

All endpoints return standard error responses in the following format:

```json
{
  "error": "error_message"
}
```

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse. Exceeding the rate limit will result in a 429 (Too Many Requests) response.