FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci --ignore-scripts

COPY frontend/ .

RUN npx ng build --configuration production

FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY infrastructure/docker/production/angular/default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/golifecraft/browser /usr/share/nginx/html

RUN find /usr/share/nginx/html -name "*.map" -type f -delete

RUN rm -rf /usr/share/nginx/html/assets/*.map 2>/dev/null || true

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
