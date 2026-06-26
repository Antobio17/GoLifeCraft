# ─── Base stage: shared PHP extensions ───────────────────────────────
FROM php:8.5-fpm AS base

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        qpdf \
        ghostscript \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libicu-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install mysqli pdo pdo_mysql opcache gd intl

# ─── Builder stage: install dependencies and warm cache ──────────────
FROM base AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gnupg \
        wget \
        dirmngr \
        git \
        unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY backend/ /var/www/html/
WORKDIR /var/www/html/

# Install dependencies optimized for production (no dev dependencies)
RUN php -d memory_limit=-1 /usr/local/bin/composer install \
    --no-dev \
    --no-interaction \
    --optimize-autoloader \
    --classmap-authoritative \
    --no-scripts

# Warm up Symfony cache for production
RUN APP_ENV=prod php bin/console cache:clear --no-warmup && \
    APP_ENV=prod php bin/console cache:warmup

# ─── Production stage: clean runtime image ───────────────────────────
FROM base

# Copy production PHP configuration
COPY infrastructure/docker/production/php/php_fpm.ini /usr/local/etc/php/php.ini
COPY infrastructure/docker/production/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY infrastructure/docker/production/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copy application from builder stage
COPY --from=builder /var/www/html /var/www/html
WORKDIR /var/www/html/

# Create upload directory with correct permissions
RUN mkdir -p var/uploads var/log var/cache && \
    chown -R www-data:www-data var/

EXPOSE 9000

USER www-data
