import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    provider: "postgresql", // Using PostgreSQL with Neon
    url: process.env.NEON_DATABASE_URL!,
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  csrf: {
    enabled: true,
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
    requireEmailVerification: false, // Disable for non-production
  },
  twoFactor: {
    enabled: false, // Disable for non-production
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