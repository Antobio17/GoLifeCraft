#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

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

[ -f "$ENV_FILE" ] || bash .devcontainer/on-create.sh

step "Starting ${SERVICES[*]}"
compose up -d "${SERVICES[@]}"

wait_for_mysql

step "Syncing Composer dependencies"
docker exec "$PHP_CONTAINER" composer install --no-interaction --prefer-dist
docker exec "$PHP_CONTAINER" chown -R www-data:www-data config/jwt var

step "Creating the master database schema"
php_console doctrine:schema:update --force --em=tenant_manager
php_console doctrine:schema:update --force

step "Loading the test user and seed data"
bash e2e/scripts/seed.sh || echo "⚠ Seed failed, continuing without test data"

install_frontend_dependencies

echo "✔ Environment ready. User: e2e@golifecraft.test / GoLifeCraft123!"
