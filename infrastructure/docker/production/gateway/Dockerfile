FROM nginx:stable-alpine

RUN apk add --no-cache openssl

COPY infrastructure/docker/production/gateway/default.conf /etc/nginx/conf.d/default.conf
COPY infrastructure/docker/production/gateway/docker-entrypoint.sh /docker-entrypoint-custom.sh

RUN rm -f /etc/nginx/conf.d/default.conf.bak \
    && chmod +x /docker-entrypoint-custom.sh

ENTRYPOINT ["/docker-entrypoint-custom.sh"]
