-- GoLifeCraft - esquema inicial de base de datos (entorno local)
-- Crea la base de datos central (master) y un tenant de ejemplo.
-- Las tablas las genera Doctrine con:
--   php bin/console doctrine:schema:update --force          (master)
--   php bin/console app:tenant:schema-update --force        (tenants)
CREATE SCHEMA IF NOT EXISTS `master` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE SCHEMA IF NOT EXISTS `tenant_1` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
