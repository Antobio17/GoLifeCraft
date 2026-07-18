FROM php:8.5-fpm

# 1. Install base tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gnupg \
        wget \
        dirmngr \
        ca-certificates

# 2. Install MySQL client, Git, qpdf and GD libraries from the official Debian repos
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        unzip \
        cron \
        default-mysql-client \
        qpdf \
        ghostscript \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libicu-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 3. PHP configuration (remaining commands)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install mysqli pdo pdo_mysql gd intl

COPY infrastructure/docker/local/php/php_fpm.ini /usr/local/etc/php/php.ini

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN wget -O /usr/local/bin/phpunit https://phar.phpunit.de/phpunit-11.phar && \
    chmod +x /usr/local/bin/phpunit

COPY infrastructure/docker/local/php/www.conf /usr/local/etc/php-fpm.d/www.conf

COPY infrastructure/docker/local/cron/openfoodfacts-sync.cron /etc/cron.d/openfoodfacts-sync
RUN chmod 0644 /etc/cron.d/openfoodfacts-sync

COPY backend/ /var/www/html/
WORKDIR /var/www/html/

RUN mkdir -p var/uploads && chown www-data:www-data var/uploads

# RUN php -d memory_limit=-1 /usr/local/bin/composer install --no-scripts -vvvv

EXPOSE 9000
