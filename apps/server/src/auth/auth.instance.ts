import { betterAuth, BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '@repo/database';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { admin } from 'better-auth/plugins';

export const authConfig = (
  database: PostgresJsDatabase,
  config: ConfigService,
): BetterAuthOptions => ({
  logger: {
    disabled: false,
    level: 'debug',
  },
  basePath: '/api/auth',
  appName: 'drobit',
  database: drizzleAdapter(database, {
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
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: config.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || '',
      enabled: !!(
        config.get<string>('GOOGLE_CLIENT_ID') &&
        config.get<string>('GOOGLE_CLIENT_SECRET')
      ),
    },
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
      impersonationSessionDuration: 60 * 15, // 15 minutes
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: config.get<string>('BETTER_AUTH_SECRET') || randomUUID(),
  baseURL: config.get<string>('BETTER_AUTH_URL'),
  trustedOrigins: [
    config.get<string>('CORS_ORIGIN') || '',
    config.get<string>('BETTER_AUTH_URL') || '',
  ],
  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },
});

export const auth = (database: PostgresJsDatabase, config: ConfigService) =>
  betterAuth(authConfig(database, config));

// export type User = typeof auth.$Infer.Session.user;
