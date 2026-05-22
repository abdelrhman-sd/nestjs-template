
# base
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

# dev
FROM base AS dev

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

# build
FROM base AS build

RUN npm ci

COPY . .

RUN npm run build

# prod
FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

CMD ["node", "dist/main.js"]
