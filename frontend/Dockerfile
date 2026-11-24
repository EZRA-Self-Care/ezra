# syntax=docker/dockerfile:1
#
# Two usable targets (docker build --target <name>):
#   dev  - Metro dev server for Expo Go / simulators / browser, with live reload via bind mount
#   web  - static web export served by nginx (the default, last stage)
#
# This does NOT run the iOS/Android app. Native binaries are built with EAS (see AGENTS.md).

# Expo SDK 58 / React Native 0.88 require Node.js 22.13 or newer.
ARG NODE_VERSION=22

# ---------- deps ----------
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- dev ----------
FROM node:${NODE_VERSION}-slim AS dev
ENV EXPO_NO_TELEMETRY=1
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/ezra-dev-entrypoint
RUN chmod 755 /usr/local/bin/ezra-dev-entrypoint
COPY --chown=node:node . .
USER node
ENTRYPOINT ["/usr/local/bin/ezra-dev-entrypoint"]
EXPOSE 8081
CMD ["npx", "expo", "start"]

# ---------- build (web export) ----------
FROM deps AS build
# EXPO_PUBLIC_* values are inlined into the JS bundle at build time, so the API URL is
# fixed per image. Changing it means rebuilding.
ARG EXPO_PUBLIC_API_URL=http://localhost:5000
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL} \
    EXPO_NO_TELEMETRY=1 \
    CI=1
COPY . .
RUN npx expo export -p web

# ---------- web ----------
FROM nginxinc/nginx-unprivileged:stable-alpine AS web
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
