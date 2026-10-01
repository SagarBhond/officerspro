# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
WORKDIR /app

# Install from the lockfile separately so source edits reuse this layer.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# Serve only the generated static site; this image runs as the unprivileged nginx user.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY --from=build --chown=101:101 /app/dist/ /usr/share/nginx/html/
COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
