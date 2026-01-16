Observability Implementation Walkthrough
This document details the changes made to implement structured logging and metrics for both the NestJS (Backend) and Next.js (Frontend) applications.

1. NestJS (Backend) - apps/server
Logging
Replaced the default logger with nestjs-pino.
Configured logging to be JSON format in production (optimal for Loki) and pretty-printed in development.
Logs now include request/response details via pino-http.
Metrics
Integrated @willsoto/nestjs-prometheus to expose default system metrics (CPU, memory, etc.).
Metrics are available at the default /metrics endpoint.
Key Files Modified:

app.module.ts
main.ts
2. Next.js (Frontend) - apps/web
Logging (Server-Side)
Implemented a singleton logger utility using pino.
Similar to backend: JSON in production, pretty in development.
Added example usage in the main Server Component (app/page.tsx).
Metrics
Created a new API Route Handler at /api/metrics to expose Node.js metrics using prom-client.
Note: This endpoint is public by default within the cluster network.
Key Files Created/Modified:

lib/logger.ts
app/api/metrics/route.ts
app/page.tsx
Verification Results
Build Verification
Backend: nest build passed successfully.
Frontend: next build passed successfully (with Turbopack).
How to Verify Manually
Backend Metrics:

Start backend: cd apps/server && pnpm dev
Visit: http://localhost:<PORT>/metrics (check default NestJS port, likely 3000 or defined in .env).
Frontend Metrics:

Start frontend: cd apps/web && pnpm dev
Visit: http://localhost:3000/api/metrics.
Logging:

Observe terminal output during development.
Build and run with NODE_ENV=production to see JSON logs.
3. Sentry Integration Implementation
Backend (NestJS)
Installed @sentry/nestjs and configured SentryModule.
Implemented SentryFilter to catch and report exceptions while preserving Pino logs.
Updated CORS to allow sentry-trace and baggage headers for distributed tracing.
Frontend (Next.js)
Installed @sentry/nextjs.
Configured client, server, and edge Sentry initialization.
Wrapped next.config.js to handle source map uploads.
Deployment & Release Instructions
To ensure errors are correctly associated with releases (Source Maps), you must inject the SENTRY_RELEASE environment variable.

1. Docker Build (Next.js)
You must pass SENTRY_RELEASE as a build argument so source maps are uploaded with the correct tag.

# In your Dockerfile
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=${SENTRY_RELEASE}
Command:

docker build --build-arg SENTRY_RELEASE=$(git rev-parse HEAD) ...
2. Kubernetes Deployment
Inject the SENTRY_RELEASE environment variable into your containers.

# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
        - name: server
          env:
            - name: SENTRY_DSN
              valueFrom:
                secretKeyRef:
                  name: sentry-secrets
                  key: dsn
            - name: SENTRY_RELEASE
              value: "git-commit-sha-or-tag" # <--- Inject this from your CI/CD pipeline
CI/CD Example (GitHub Actions):

- name: Deploy to K8s
  run: |
    kubectl set env deployment/my-app SENTRY_RELEASE=${GITHUB_SHA}