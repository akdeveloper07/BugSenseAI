
# BugSense AI - Frontend Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build the Vite application
RUN npm run build

# Serve the production build
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
