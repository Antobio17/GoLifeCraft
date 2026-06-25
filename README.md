# GoLifeCraft

Aplicación para gestionar lista de la compra, recetas, menús diarios y calorías
(consumidas y objetivo), con planes de incorporar sesiones de gimnasio y
ejercicio en el futuro.

De momento es de uso personal, pero la arquitectura está preparada para ser
**multitenant** (varios usuarios/organizaciones aislados por base de datos).

## Stack

- **Backend**: Symfony 6.4 (PHP 8.3), Doctrine ORM 3, JWT (`lexik/jwt-authentication-bundle`),
  Symfony Messenger como bus CQRS. Arquitectura DDD + Hexagonal por módulos.
- **Frontend**: Angular (standalone components), arquitectura Hexagonal + DDD por feature.
- **Infraestructura**: Docker (entornos `local` y `production`), Nginx, MySQL 8, GitHub Actions.

## Estructura del monorepo

```
GoLifeCraft/
├── backend/          # API Symfony
├── frontend/         # App Angular
├── infrastructure/   # Dockerfiles y configuración de despliegue
├── .github/          # Workflows de CI/CD
├── docker-compose.yml         # Entorno local
├── docker-compose.prod.yml    # Entorno de producción
└── Makefile
```

### Módulos del esqueleto

- **Authorization/User** — login JWT, gestión de usuarios, perfil y cambio de contraseña.
- **Organization/Central** — registro central de tenants.
- **Shared/Tenant** — resolución de tenant y actualización de esquema por tenant.
- **Shared/Shared** — kernel compartido (buses CQRS, `DomainEventLog`, managers, middlewares).
- **Shared/Tool** — utilidades transversales.

> El dominio propio de la app (lista de compra, recetas, menús, calorías…) se irá
> añadiendo como nuevos módulos siguiendo los patrones descritos en `CLAUDE.md`.

## Multi-tenancy

- Base de datos `master`: usuarios y registro central.
- Una base de datos por tenant para los datos de negocio.
- Configuración en `backend/.env` (`DATABASE_MASTER_*`, `DATABASE_TENANT_*`).

## Configuración de secretos (`.env.local`)

Las credenciales (contraseña de MySQL, `APP_SECRET`, `JWT_PASSPHRASE`, etc.) **no
están versionadas**. Viven en un único `.env.local` en la raíz, ignorado por git,
que alimenta tanto la interpolación de docker-compose (servicio `db`) como el
contenedor PHP (vía `env_file`). Por eso el `Makefile` invoca compose con
`--env-file .env.local`.

```bash
# Crear el fichero a partir de la plantilla y rellenar los valores reales
cp .env.local.dist .env.local
```

> En local, `.env.local` lleva `APP_ENV=dev`; en el servidor de producción, `APP_ENV=prod`.
> La contraseña de la BD se define una sola vez en `DATABASE_MASTER_PASSWORD` y el
> servicio `db` la reutiliza como `MYSQL_ROOT_PASSWORD`.

## Puesta en marcha (local)

```bash
# Levantar contenedores (php, nginx, mysql)
make up

# Backend: dependencias y esquema
docker exec golifecraft_php sh -lc 'composer install'
docker exec golifecraft_php sh -lc 'php bin/console doctrine:schema:update --force'
docker exec golifecraft_php sh -lc 'php bin/console app:tenant:schema-update --force'

# Frontend
cd frontend && npm install && ng serve --proxy-config proxy.conf.json
```

Comandos del `Makefile`: `make up`, `make down`, `make build`, `make logs`, `make ps`,
`make up-production`, `make down-production`.

## Notas

- Las claves JWT (`backend/config/jwt/`) se generan localmente y no se versionan.
- En `docker-compose.prod.yml` hay rutas marcadas con `# TODO` que deben ajustarse al
  servidor de despliegue, así como el dominio en `infrastructure/docker/production/`.
- El logo (`frontend/src/assets/img/logo.png`) es un placeholder; sustitúyelo por el definitivo.
