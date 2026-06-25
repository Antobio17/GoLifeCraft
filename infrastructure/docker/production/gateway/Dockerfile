FROM nginx:stable-alpine

COPY infrastructure/docker/production/gateway/default.conf /etc/nginx/conf.d/default.conf

RUN rm -f /etc/nginx/conf.d/default.conf.bak
