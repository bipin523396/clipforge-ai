# ClipForge AI - Production Dockerfile for Render.com / Cloud Containers 🚀
# Multi-stage build with FFmpeg, Python, yt-dlp, and Next.js Standalone server

# 1. Base image with system video dependencies
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install FFmpeg, Python3, fonts for subtitles, and yt-dlp binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    fonts-dejavu \
    fonts-freefont-ttf \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# 2. Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment and build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# 4. Production Runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Expose Next.js port
EXPOSE 3000

# Copy built artifacts from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create scratch directories with write permissions
RUN mkdir -p /tmp/clipforge-jobs /tmp/clipforge-renders /tmp/clipforge-downloads \
    && chmod -R 777 /tmp/clipforge*

CMD ["node", "server.js"]
