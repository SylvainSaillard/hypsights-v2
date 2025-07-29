FROM node:22-slim AS base
WORKDIR /frontend
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
RUN npm update -g npm

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install

FROM base AS builder
COPY --from=deps /frontend/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /frontend/dist ./dist
COPY package.json package-lock.json ./
EXPOSE 3000
CMD ["npx", "serve", "dist"]