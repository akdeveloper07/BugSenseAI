
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install dependencies without running Prisma postinstall
RUN npm ci --include=dev --ignore-scripts

# Copy the complete project, including the Prisma schema
COPY . .

# Generate Prisma Client after the schema is available
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build API and web applications
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "@bugsense/api"]
