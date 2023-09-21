FROM node:20-alpine3.18

WORKDIR /www/var/app

COPY package*.json ./

COPY client/package*.json client/
RUN npm run install-client --omit=dev

COPY server/package*.json server/
RUN npm run install-server --omit=dev

COPY client/ client/
RUN npm run build --prefix client

COPY server/ server/

USER node

EXPOSE 8000

CMD [ "npm", "run", "server-prod"]