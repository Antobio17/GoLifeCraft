# Codespaces

Develop and test GoLifeCraft from the browser (iPad included) before deploying.

## Start

GitHub → **Code** → **Codespaces** → **Create codespace on master**.

The first creation takes 5–10 minutes. When it ends with `✔ Environment ready`,
open the **Ports** tab and click the globe on port **4200**.

If the page stays blank, open the codespace in a regular Safari tab (not a
web app added to the Home Screen) and give the first build a minute.

## Login

Email:

```
e2e@golifecraft.test
```

Password:

```
GoLifeCraft123!
```

## Frontend

Follow the dev server log:

```bash
tail -f /tmp/golifecraft-frontend.log
```

Restart the dev server:

```bash
pkill -f "ng serve"; bash .devcontainer/start.sh
```

Lint and format:

```bash
cd frontend && npx ng lint --fix && npx prettier --write "src/**/*.{ts,html,scss,css,json}"
```

Unit tests:

```bash
cd frontend && npx ng test --watch=false
```

## Backend

Update the database schema after touching entities:

```bash
docker exec golifecraft_php php bin/console doctrine:schema:update --force --em=tenant_manager
docker exec golifecraft_php php bin/console doctrine:schema:update --force
docker exec golifecraft_php php bin/console app:tenant:schema-update --force
```

Run the tests:

```bash
docker exec golifecraft_php php bin/phpunit
```

Fix code style:

```bash
docker exec golifecraft_php ./vendor/bin/php-cs-fixer fix src/
```

Clear the Symfony cache:

```bash
docker exec golifecraft_php php bin/console cache:clear
```

Follow the PHP logs:

```bash
docker logs -f golifecraft_php
```

## Database

Open a MySQL shell:

```bash
docker exec -it golifecraft_mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"'
```

Reload the test user and seed data:

```bash
bash e2e/scripts/seed.sh
```

## E2E

```bash
cd e2e && npm ci && npx playwright install --with-deps chromium
```

```bash
cd e2e && npm test
```

## Containers

```bash
docker ps
```

```bash
docker compose --env-file .env.local -f docker-compose.yml -f .devcontainer/docker-compose.codespace.yml restart
```

## Usage quota

Stop the codespace when you are done, and delete the ones you no longer use:
storage is billed even while a codespace is stopped.

- Manage codespaces: https://github.com/codespaces
- Check usage: https://github.com/settings/billing
