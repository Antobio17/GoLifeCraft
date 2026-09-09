-- ---------------------------------------------------------------------------
-- Usuario semilla de la suite end to end (base de datos `master`).
--
-- Idempotente: se puede lanzar sobre una master que ya lo tenga.
-- La contraseña en claro es GoLifeCraft123! (bcrypt cost 13, el mismo hasher
-- que `security.password_hashers: auto`). Regenerable con:
--   docker exec golifecraft_php php bin/console security:hash-password
--
-- El tenant apunta a GLCE2E000001, una base de datos exclusiva de los tests:
-- ningún test toca jamás los datos de desarrollo.
-- ---------------------------------------------------------------------------

DELETE FROM `refresh_token` WHERE `user_id` = 'e2e00000-0000-4000-8000-000000000001';
DELETE FROM `user` WHERE `id` = 'e2e00000-0000-4000-8000-000000000001';
DELETE FROM `user` WHERE `email` = 'e2e@golifecraft.test';

INSERT INTO `user` (
  `id`, `version`, `name`, `lastname`, `roles`, `email`, `username`, `password`,
  `tenant_id`, `role`, `is_active`, `email_verified`,
  `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`, `theme`
) VALUES (
  'e2e00000-0000-4000-8000-000000000001',
  1,
  'E2E',
  'Runner',
  '["ROLE_GOD"]',
  'e2e@golifecraft.test',
  'e2e@golifecraft.test',
  '$2y$13$zdqbm3PL2wG/XPl2w.Rw2Ob6dspTXyh.gpOhEAQicxrkde6A7ONYS',
  'GLCE2E000001',
  'ROLE_GOD',
  1,
  1,
  '2026-01-01 00:00:00',
  '2026-01-01 00:00:00',
  'e2e00000-0000-4000-8000-000000000001',
  'e2e00000-0000-4000-8000-000000000001',
  'light'
);
