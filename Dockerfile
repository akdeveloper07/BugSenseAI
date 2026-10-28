
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci --include=dev

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "@bugsense/api"]
