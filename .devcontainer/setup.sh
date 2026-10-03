#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env.local"
SERVICES=(nginx php db)
PHP_CONTAINER="golifecraft_php"
DB_CONTAINER="golifecraft_mysql"

step() { echo "▸ $1"; }

compose() { docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f .devcontainer/docker-compose.codespace.yml "$@"; }

php_console() { docker exec "$PHP_CONTAINER" php bin/console "$@"; }

create_env_file() {
  if [ -f "$ENV_FILE" ]; then
    step "$ENV_FILE already exists, keeping it"
    return
  fi

  step "Generating $ENV_FILE with random secrets"
  local db_password app_secret jwt_passphrase
  db_password="$(openssl rand -hex 16)"
  app_secret="$(openssl rand -hex 32)"
  jwt_passphrase="$(openssl rand -hex 16)"

  sed \
    -e "s/^APP_ENV=.*/APP_ENV=dev/" \
    -e "s/^APP_DEBUG=.*/APP_DEBUG=1/" \
    -e "s/^APP_SECRET=.*/APP_SECRET=${app_secret}/" \
    -e "s/change_me_db_password/${db_password}/g" \
    -e "s/^JWT_PASSPHRASE=.*/JWT_PASSPHRASE=${jwt_passphrase}/" \
    -e "s/^GEMINI_KEY=.*/GEMINI_KEY=/" \
    -e "s/^VAPID_PUBLIC_KEY=.*/VAPID_PUBLIC_KEY=/" \
    -e "s/^VAPID_PRIVATE_KEY=.*/VAPID_PRIVATE_KEY=/" \
    backend/.env.local.dist > "$ENV_FILE"

  echo "MAILER_DSN=null://null" >> "$ENV_FILE"
}

wait_for_mysql() {
  step "Waiting for MySQL"
  local password
  password="$(grep '^DATABASE_MASTER_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)"
  for _ in $(seq 1 90); do
    if docker exec -e MYSQL_PWD="$password" "$DB_CONTAINER" mysql -uroot -h127.0.0.1 -e "SELECT 1" >/dev/null 2>&1; then
      return
    fi
    sleep 2
  done
  echo "✖ MySQL did not respond in time" >&2
  exit 1
}

create_env_file

step "Building and starting ${SERVICES[*]}"
compose up -d --build "${SERVICES[@]}"

wait_for_mysql

step "Installing Composer dependencies"
docker exec "$PHP_CONTAINER" composer install --no-interaction --prefer-dist

step "Generating the JWT keypair"
php_console lexik:jwt:generate-keypair --skip-if-exists
docker exec "$PHP_CONTAINER" chown -R www-data:www-data config/jwt var

step "Creating the master database schema"
php_console doctrine:schema:update --force --em=tenant_manager
php_console doctrine:schema:update --force

step "Loading the test user and seed data"
bash e2e/scripts/seed.sh

step "Installing frontend dependencies"
(cd frontend && npm ci)

echo "✔ Environment ready. User: e2e@golifecraft.test / GoLifeCraft123!"
