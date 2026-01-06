import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '@repo/database';
import { db } from '@repo/database';
import { randomUUID } from 'crypto';

export const auth = () =>
  betterAuth({
    logger: {
      disabled: false,
      log: console.log,
      level: 'debug',
    },
    appName: 'drobit',
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true in production
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        enabled: !!(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ),
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000/api',
    trustedOrigins: [
      process.env.BETTER_AUTH_URL || 'http://localhost:4000',
      process.env.CORS_ORIGIN || 'http://localhost:3000',
    ],
    advanced: {
      database: {
        generateId: () => randomUUID(),
      },
    },
  });

// export type User = typeof auth.$Infer.Session.user;
