import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    // Tracing
    tracesSampleRate: 1.0, // Adjust for production
    // Profiling
    profilesSampleRate: 1.0,
    integrations: [
        nodeProfilingIntegration(),
    ],
});
