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

## Despliegue en producción

El despliegue es **auto-aprovisionado**: el servidor no necesita nada del proyecto
instalado previamente. Los workflows de GitHub Actions crean en cada deploy todo lo
que falte (directorios, compose, `.env.local`, claves JWT, esquema de BD).

### Puesta en marcha completa (orden de ejecución)

Runbook de cero a producción. Los pasos marcados **[servidor]** son la parte manual
que solo se hace una vez por servidor; el resto es en tu máquina / GitHub.

1. Generar los dos pares de claves SSH → ver [Claves SSH](#claves-ssh).
2. **[servidor]** Crear el servidor en Hetzner registrando tu clave **personal**
   pública en *Security → SSH Keys* (así entras como root sin password).
3. **[servidor]** Inicializar el servidor: Docker + usuario `deploy` + clave de
   deploy → ver [Inicialización del servidor](#inicialización-del-servidor-una-sola-vez).
4. Configurar los secrets en GitHub → ver [Secrets de GitHub Actions](#secrets-de-github-actions).
5. Apuntar el **DNS** del dominio a la IP del servidor.
6. Lanzar el primer deploy (`workflow_dispatch` en los workflows de deploy, o un
   push a master).
7. **[servidor]** Emitir el **certificado TLS inicial** (ver más abajo).

> Los pasos 1-3 (claves y servidor) ya están hechos en el servidor actual; se
> documentan aquí por si hay que reconstruir el servidor o migrar a otro.

### Flujo de CI/CD

```
push a master
├── Backend  - Build and Push Docker Images ──> Backend  - Deploy to Production Server
└── Frontend - Build and Push Docker Images ──> Frontend - Deploy to Production Server
```

Los workflows de *publish* construyen y suben las imágenes a GHCR; al terminar con
éxito se disparan los de *deploy* (también lanzables a mano con `workflow_dispatch`).

Cada deploy hace, por SSH contra el servidor:

1. Sube `docker-compose.prod.yml` desde el repo a `SERVER_PROJECT_PATH` (scp).
2. Crea el árbol de volúmenes si no existe: `volumes/{public_uploads,internal_uploads,jwt_keys}`.
3. Escribe `.env.local` desde el secret `PROD_ENV_FILE` (con `chmod 600`).
4. Hace login en GHCR, `pull` de las imágenes y `docker compose up -d`.
5. *(Solo backend)* Espera a que MySQL esté listo, genera el par de claves JWT con
   `lexik:jwt:generate-keypair --skip-if-exists` (persisten en el volumen `jwt_keys`)
   y actualiza el esquema de la BD master y de los tenants.

### Secrets de GitHub Actions

| Secret | Contenido |
|---|---|
| `SERVER_HOST` | IP o hostname del servidor |
| `SERVER_USER` | Usuario SSH del deploy (`deploy`) |
| `SERVER_SSH_KEY` | Clave privada SSH **completa** (incluidas las líneas `BEGIN/END`) |
| `SERVER_SSH_PASSPHRASE` | Passphrase de la clave privada |
| `SERVER_SSH_PORT` | Puerto SSH (opcional, por defecto 22) |
| `SERVER_PROJECT_PATH` | Ruta del proyecto en el servidor (`/home/deploy/golifecraft/prod`) |
| `GHCR_TOKEN` | PAT con scope `read:packages` para hacer pull de GHCR |
| `PROD_ENV_FILE` | Contenido completo del `.env.local` de producción (el `.env.local.dist` relleno con valores reales y `APP_ENV=prod`) |

```bash
# Subir secrets con gh CLI
gh secret set SERVER_SSH_KEY < ~/.ssh/golifecraft_prod_deploy
gh secret set PROD_ENV_FILE < .env.local.prod
gh secret set SERVER_SSH_PASSPHRASE   # pide el valor interactivamente
```

#### Generar el `GHCR_TOKEN`

Es un Personal Access Token de GitHub que el servidor usa para hacer *pull* de las
imágenes desde GHCR (los packages nacen privados por defecto).

1. GitHub → avatar → **Settings** → **Developer settings** → **Personal access
   tokens** → **Tokens (classic)** → **Generate new token (classic)**.
2. Nombre (`golifecraft-ghcr-pull`) y expiración.
3. Marcar **solo** el scope `read:packages` (es suficiente para desplegar).
4. **Generate token** y copiar el valor `ghp_...` (solo se muestra una vez).

```bash
gh secret set GHCR_TOKEN   # pega el ghp_... cuando lo pida
```

> Alternativa: un *fine-grained token* con permiso **Packages: Read-only** funciona
> igual. El PAT va asociado a tu cuenta, lo cual es correcto al ser el repo tuyo.

### Claves SSH

Se usan **dos pares distintos**, ambos `ed25519` con passphrase:

```bash
# Clave personal (para administrar el servidor)
ssh-keygen -t ed25519 -a 100 -C "antonio@portatil" -f ~/.ssh/id_ed25519_golifecraft

# Clave de deploy (solo para GitHub Actions; no reutilizar la personal)
ssh-keygen -t ed25519 -a 100 -C "github-actions@golifecraft" -f ~/.ssh/golifecraft_prod_deploy
```

- La **pública** (`.pub`) va al servidor: en Hetzner Cloud se registra en
  *Security → SSH Keys* al crear el servidor (queda en `/root/.ssh/authorized_keys`);
  en un servidor ya creado, `ssh-copy-id -i <clave>.pub root@SERVIDOR`.
- La **privada** no sale de tu máquina, salvo la de deploy, que se guarda en el
  secret `SERVER_SSH_KEY` junto a su passphrase en `SERVER_SSH_PASSPHRASE`.
- Tras verificar el acceso por clave, endurecer el sshd del servidor:
  `PermitRootLogin prohibit-password` y `PasswordAuthentication no` en
  `/etc/ssh/sshd_config`, seguido de `systemctl reload sshd`.

Entrada cómoda desde tu máquina (`~/.ssh/config`):

```
Host golifecraft
    HostName TU_SERVIDOR
    User root
    IdentityFile ~/.ssh/id_ed25519_golifecraft
    IdentitiesOnly yes
```

### Inicialización del servidor (una sola vez)

Lo único que el deploy **no** hace por sí mismo. En el servidor, como root
(Ubuntu/Debian):

```bash
# 1. Instalar Docker (incluye el plugin de Docker Compose)
curl -fsSL https://get.docker.com | sh

# 2. Crear el usuario deploy (sin password, solo entrará por clave) con acceso a Docker
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy

# 3. Autorizar la clave pública de deploy (contenido de golifecraft_prod_deploy.pub)
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "ssh-ed25519 AAAA... github-actions@golifecraft" >> /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
```

Verificación desde tu máquina (si responde, GitHub Actions podrá desplegar):

```bash
ssh -i ~/.ssh/golifecraft_prod_deploy deploy@TU_SERVIDOR docker ps
```

Después:

1. **DNS** del dominio apuntando al servidor.
2. **Primer deploy**: lanzar los workflows de deploy a mano (`workflow_dispatch`)
   con los secrets ya configurados (`SERVER_USER=deploy`,
   `SERVER_PROJECT_PATH=/home/deploy/golifecraft/prod`).
3. **Certificado TLS inicial**: el contenedor `certbot` solo renueva; la primera
   emisión se hace una vez, como `deploy`, con los servicios ya levantados:

   ```bash
   cd /home/deploy/golifecraft/prod
   docker compose --env-file .env.local -f docker-compose.prod.yml run --rm \
     --entrypoint certbot certbot certonly --webroot -w /var/www/certbot -d TU_DOMINIO
   docker compose --env-file .env.local -f docker-compose.prod.yml restart gateway
   ```

   Hasta que exista el certificado, el `gateway` reiniciará en bucle: es esperable
   en el primer deploy de un servidor virgen.

### Layout resultante en el servidor

```
$SERVER_PROJECT_PATH/
├── docker-compose.prod.yml   # subido por el workflow en cada deploy
├── .env.local                # escrito desde el secret PROD_ENV_FILE
└── volumes/
    ├── public_uploads/       # montado en nginx
    ├── internal_uploads/     # montado en php (var/uploads)
    └── jwt_keys/             # par de claves JWT generado en el primer deploy

/var/lib/golifecraft-mysql-docker/   # datos de MySQL (lo crea Docker)
```

> Para rotar las claves JWT basta con vaciar `volumes/jwt_keys/` y relanzar el
> deploy (invalida todas las sesiones activas). Para cambiar variables de entorno,
> actualizar el secret `PROD_ENV_FILE` y relanzar el deploy.

### Acceso a MySQL en producción

Primero conectar por SSH al servidor (ver [Claves SSH](#claves-ssh)):

```bash
ssh golifecraft   # o: ssh -i ~/.ssh/id_ed25519_golifecraft deploy@TU_SERVIDOR
cd $SERVER_PROJECT_PATH
```

Entrar al cliente `mysql` dentro del contenedor `golifecraft_mysql`, reutilizando
la contraseña root ya presente en el propio entorno del contenedor (evita tener
que copiarla a mano desde `.env.local`):

```bash
docker exec -it golifecraft_mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"'
```

Solo shell del contenedor, sin entrar a `mysql`:

```bash
docker exec -it golifecraft_mysql bash
```

> ⚠️ Es la base de datos real de producción: cualquier `UPDATE`/`DELETE` afecta
> datos de usuarios. Antes de tocar algo, considera un `mysqldump` de seguridad.

## Notas

- Las claves JWT (`backend/config/jwt/`) no se versionan. En local se generan con
  `lexik:jwt:generate-keypair`; en producción las genera el workflow de deploy
  automáticamente si no existen.
- El dominio debe ajustarse en `infrastructure/docker/production/`.
- El logo (`frontend/src/assets/img/logo.png`) es un placeholder; sustitúyelo por el definitivo.

claude --resume ab0eda6a-5e46-482e-a500-25ac890921cd