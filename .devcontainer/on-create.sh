#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

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

create_env_file

step "Building images"
compose build "${SERVICES[@]}"

step "Installing Composer dependencies"
compose run --rm --no-deps php composer install --no-interaction --prefer-dist

step "Generating the JWT keypair"
compose run --rm --no-deps php php bin/console lexik:jwt:generate-keypair --skip-if-exists

install_frontend_dependencies

echo "✔ Prebuild steps done"
