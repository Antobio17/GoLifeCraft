#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Deja la base de datos en el estado exacto que esperan los tests end to end.
#
#   ./scripts/seed.sh            recarga los datos del tenant de test
#   ./scripts/seed.sh --reset    además tira y recrea la base del tenant
#
# El esquema NUNCA se versiona en SQL: lo genera Doctrine
# (`app:tenant:schema-update`), que es la única fuente de verdad. Aquí sólo se
# crean la base, se vacían las tablas y se cargan las filas de fixtures/sql.
#
# Sólo se toca la base GLCE2E000001 y el usuario e2e@golifecraft.test: los
# datos de desarrollo del programador se quedan donde están.
# ---------------------------------------------------------------------------
set -euo pipefail

TENANT_DB="${E2E_TENANT_DB:-GLCE2E000001}"
PHP_CONTAINER="${E2E_PHP_CONTAINER:-golifecraft_php}"
DB_CONTAINER="${E2E_DB_CONTAINER:-golifecraft_mysql}"
SQL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../fixtures/sql" && pwd)"
RESET=0

for arg in "$@"; do
  case "$arg" in
    --reset) RESET=1 ;;
    *) echo "Opción desconocida: $arg" >&2; exit 64 ;;
  esac
done

if [ "$TENANT_DB" = "tenant_1" ] || [[ "$TENANT_DB" != GLC* ]]; then
  echo "✖ E2E_TENANT_DB debe empezar por GLC y no puede ser el tenant de desarrollo." >&2
  exit 65
fi

die() { echo "✖ $1" >&2; exit 1; }

docker inspect "$DB_CONTAINER" >/dev/null 2>&1 || die "El contenedor $DB_CONTAINER no está levantado. Lanza \`make up\`."
docker inspect "$PHP_CONTAINER" >/dev/null 2>&1 || die "El contenedor $PHP_CONTAINER no está levantado. Lanza \`make up\`."

# Las credenciales se leen del propio contenedor: ni se duplican en un .env de
# la suite ni se quedan desfasadas si cambian en docker-compose.
php_env() { docker exec "$PHP_CONTAINER" printenv "$1" 2>/dev/null || true; }

DB_USER="${E2E_DB_USER:-$(php_env DATABASE_MASTER_USER)}"
DB_PASSWORD="${E2E_DB_PASSWORD:-$(php_env DATABASE_MASTER_PASSWORD)}"
MASTER_DB="${E2E_MASTER_DB:-$(php_env DATABASE_MASTER_NAME)}"

[ -n "$DB_USER" ] || die "No se pudo leer DATABASE_MASTER_USER del contenedor $PHP_CONTAINER."
[ -n "$MASTER_DB" ] || MASTER_DB="master"

mysql_run() {
  docker exec -i -e MYSQL_PWD="$DB_PASSWORD" "$DB_CONTAINER" \
    mysql --default-character-set=utf8mb4 -u"$DB_USER" "$@"
}

echo "▸ Tenant de pruebas: $TENANT_DB (master: $MASTER_DB)"

if [ "$RESET" -eq 1 ]; then
  echo "▸ Tirando $TENANT_DB"
  mysql_run -e "DROP DATABASE IF EXISTS \`$TENANT_DB\`" >/dev/null
fi

echo "▸ Creando la base del tenant si no existe"
mysql_run -e "CREATE DATABASE IF NOT EXISTS \`$TENANT_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci" >/dev/null

echo "▸ Aplicando el esquema de Doctrine al tenant"
docker exec "$PHP_CONTAINER" php bin/console app:tenant:schema-update --force --no-interaction >/dev/null

echo "▸ Vaciando las tablas del tenant"
# La lista de tablas se pregunta al information_schema en vez de escribirse a
# mano: así una tabla nueva no deja datos zombis en la siguiente ejecución.
TRUNCATES=$(mysql_run -N -B -e "
  SELECT CONCAT('TRUNCATE TABLE \`', TABLE_NAME, '\`;')
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = '$TENANT_DB' AND TABLE_TYPE = 'BASE TABLE';
")
printf 'SET FOREIGN_KEY_CHECKS=0;\n%s\nSET FOREIGN_KEY_CHECKS=1;\n' "$TRUNCATES" \
  | mysql_run "$TENANT_DB"

echo "▸ Cargando el usuario semilla en $MASTER_DB"
mysql_run "$MASTER_DB" < "$SQL_DIR/00-master-user.sql"

echo "▸ Cargando los datos de negocio en $TENANT_DB"
mysql_run "$TENANT_DB" < "$SQL_DIR/10-tenant-data.sql"

echo "✔ Semilla lista. Usuario: e2e@golifecraft.test / GoLifeCraft123!"
