
# Stage 1: Build BugSense AI
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace manifests and lockfile
COPY package.json package-lock.json ./

# Copy workspace package manifests
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install dependencies, including TypeScript dev dependencies
RUN npm ci --include=dev

# Copy the complete source code
COPY . .

# Build the API and frontend workspaces
RUN npm run build

# Stage 2: Package the frontend
FROM node:22-alpine AS frontend

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/apps/web/dist ./dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
