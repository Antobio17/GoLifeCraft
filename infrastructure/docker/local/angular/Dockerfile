FROM node:20-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--proxy-config", "proxy.conf.docker.json", "--poll", "2000"]
