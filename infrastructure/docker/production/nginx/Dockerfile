FROM nginx:stable-alpine

RUN mkdir -p /var/www/upload/

COPY infrastructure/docker/production/nginx/default.conf /etc/nginx/conf.d/default.conf

RUN rm -f /etc/nginx/conf.d/default.conf.bak

RUN echo "server_tokens off;" > /etc/nginx/conf.d/00-security.conf
