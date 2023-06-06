FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node
