FROM php:8.5-fpm

# 1. Instalar herramientas base
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gnupg \
        wget \
        dirmngr \
        ca-certificates

# 2. Instalar cliente MySQL, Git, qpdf y librerías para GD desde los repos oficiales de Debian
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        unzip \
        default-mysql-client \
        qpdf \
        ghostscript \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libicu-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 3. Configuración de PHP (comandos restantes)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install mysqli pdo pdo_mysql gd intl

COPY infrastructure/docker/local/php/php_fpm.ini /usr/local/etc/php/php.ini

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN wget -O /usr/local/bin/phpunit https://phar.phpunit.de/phpunit-11.phar && \
    chmod +x /usr/local/bin/phpunit

COPY infrastructure/docker/local/php/www.conf /usr/local/etc/php-fpm.d/www.conf

COPY backend/ /var/www/html/
WORKDIR /var/www/html/

RUN mkdir -p var/uploads && chown www-data:www-data var/uploads

# RUN php -d memory_limit=-1 /usr/local/bin/composer install --no-scripts -vvvv

EXPOSE 9000
