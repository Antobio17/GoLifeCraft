-- MySQL dump 10.13 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: master
-- ------------------------------------------------------
-- Server version	8.0.28
--
-- La colación debe ser utf8mb4_unicode_ci, igual que la que usa el
-- TenantProvisioner al crear cada BD de tenant. Si se dejan en el default de
-- MySQL 8 (utf8mb4_0900_ai_ci), cualquier JOIN entre tablas de colaciones
-- distintas revienta con "1267 Illegal mix of collations".
CREATE SCHEMA IF NOT EXISTS `master` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE SCHEMA IF NOT EXISTS `tenant_1` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CREATE SCHEMA IF NOT EXISTS no toca una BD que ya existe, así que se fuerza
-- el default también por ALTER. Es idempotente y no toca los datos.
ALTER DATABASE `master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE `tenant_1` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
