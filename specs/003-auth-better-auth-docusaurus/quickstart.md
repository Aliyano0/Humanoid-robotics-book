# Quickstart Guide: Authentication System Using Better-Auth in Docusaurus Website

## Prerequisites
- Node.js 20+ installed
- npm or yarn package manager
- Access to environment variables for OAuth provider credentials
- PostgreSQL database (Neon recommended)

## Environment Setup
1. Create a `.env` file in the project root with the following variables:
```bash
# Better-Auth Configuration
AUTH_SECRET=your-super-secret-auth-key-here
DATABASE_URL=your-postgresql-connection-string

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

```

## Installation
1. Install Better-Auth and related dependencies:
```bash
npm install better-auth @better-auth/node docusaurus-theme-classic
```

2. Install additional dependencies for the authentication components:
```bash
npm install react-hook-form @hookform/resolvers zod
```

## Configuration
1. Create the authentication configuration file at `src/auth/auth.config.ts`:
```typescript
import { betterAuth } from "better-auth";
import { node } from "@better-auth/node";

export const auth = betterAuth({
  database: {
    provider: "postgresql", // or "sqlite" if using SQLite
    url: process.env.DATABASE_URL!,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  twoFactor: {
    enabled: false,
  },
  account: {
    accountModel: {
      additionalFields: {
        backgroundInfo: {
          type: "JSON",
          required: false,
        },
        personalizationSettings: {
          type: "JSON",
          required: false,
        },
      },
    },
  },
});

export const { server: authServer, client: authClient } = node(auth);
```

2. Update your `docusaurus.config.ts` to include authentication-related settings:
```typescript
module.exports = {
  // ... other config
  themes: [
    // ... other themes
    [require.resolve("@docusaurus/theme-classic"), {
      customCss: require.resolve("./src/css/custom.css"),
    }],
  ],
  plugins: [
    // ... other plugins
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            to: "/login",
            from: ["/auth/login", "/authentication/login"],
          },
          {
            to: "/signup",
            from: ["/auth/signup", "/authentication/signup"],
          },
        ],
      },
    ],
  ],
};
```

## Running the Application
1. Build the project:
```bash
npm run build
```

2. Start the development server:
```bash
npm run start
```

## Key Components
- **Login Form**: Located at `/src/components/auth/LoginForm.tsx`
- **Signup Form**: Located at `/src/components/auth/SignupForm.tsx`
- **Personalization Button**: Located at `/src/components/auth/PersonalizeButton.tsx`
- **Authentication Hook**: Located at `/src/hooks/useAuth.ts`

## Testing Authentication
1. Navigate to `/login` to access the login page
2. Test OAuth login with Google/GitHub
3. Test email/password authentication
5. Test the personalization feature on chapter pages