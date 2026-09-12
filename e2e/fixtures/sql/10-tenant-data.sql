-- ---------------------------------------------------------------------------
-- Datos de negocio de la suite end to end (base de datos `GLCE2E000001`).
--
-- El ESQUEMA no vive aquí: lo genera Doctrine con `app:tenant:schema-update`,
-- que es la única fuente de verdad. Este fichero sólo mete filas, para que no
-- se quede desfasado cada vez que cambia un mapping.
--
-- Los UUID son fijos y legibles por prefijo, y están espejados en
-- src/support/seed-data.ts. Ningún test escribe un id a mano.
--   e2e1… supermercados      e2e2… categorías     e2e3… artículos
--   e2e4… recetas            e2e5… nutrición      e2e6… stock / pasillos
--
-- scripts/seed.sh vacía todas las tablas del tenant antes de cargar esto.
-- ---------------------------------------------------------------------------

SET @actor = 'e2e00000-0000-4000-8000-000000000001';
SET @now = '2026-01-01 00:00:00';

-- Supermercados ------------------------------------------------------------
INSERT INTO `supermarket` (`id`, `version`, `name`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e10000-0000-4000-8000-000000000001', 1, 'E2E Mercadona', @now, @now, @actor, @actor),
  ('e2e10000-0000-4000-8000-000000000002', 1, 'E2E Lidl',      @now, @now, @actor, @actor);

-- Pasillos (definen el recorrido de la lista de la compra) ------------------
INSERT INTO `supermarket_aisle` (`id`, `version`, `supermarket_id`, `name`, `position`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e60000-0000-4000-8000-000000000001', 1, 'e2e10000-0000-4000-8000-000000000001', 'Frescos',    0, @now, @now, @actor, @actor),
  ('e2e60000-0000-4000-8000-000000000002', 1, 'e2e10000-0000-4000-8000-000000000001', 'Refrigerados', 1, @now, @now, @actor, @actor),
  ('e2e60000-0000-4000-8000-000000000003', 1, 'e2e10000-0000-4000-8000-000000000001', 'Despensa',   2, @now, @now, @actor, @actor),
  ('e2e60000-0000-4000-8000-000000000004', 1, 'e2e10000-0000-4000-8000-000000000002', 'Entrada',    0, @now, @now, @actor, @actor);

-- Categorías ---------------------------------------------------------------
INSERT INTO `category` (`id`, `version`, `name`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e20000-0000-4000-8000-000000000001', 1, 'E2E Lácteos',  @now, @now, @actor, @actor),
  ('e2e20000-0000-4000-8000-000000000002', 1, 'E2E Carnes',   @now, @now, @actor, @actor),
  ('e2e20000-0000-4000-8000-000000000003', 1, 'E2E Verduras', @now, @now, @actor, @actor);

-- Valores nutricionales (por 100 g / 100 ml) --------------------------------
INSERT INTO `nutrition_facts` (`id`, `version`, `reference_amount`, `calories`, `protein`, `carbs`, `sugars`, `fat`, `saturated_fat`, `fiber`, `salt`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e50000-0000-4000-8000-000000000001', 1, 100,  61,  3.5,  4.7, 4.7, 3.3, 2.1, 0,   0.10, @now, @now, @actor, @actor),
  ('e2e50000-0000-4000-8000-000000000002', 1, 100, 120, 23.0,  0.0, 0.0, 2.6, 0.8, 0,   0.15, @now, @now, @actor, @actor),
  ('e2e50000-0000-4000-8000-000000000003', 1, 100, 350,  7.0, 78.0, 0.2, 0.6, 0.2, 1.4, 0.01, @now, @now, @actor, @actor),
  ('e2e50000-0000-4000-8000-000000000004', 1, 100,  34,  2.8,  7.0, 1.7, 0.4, 0.1, 2.6, 0.03, @now, @now, @actor, @actor),
  ('e2e50000-0000-4000-8000-000000000005', 1, 100, 884,  0.0,  0.0, 0.0, 100, 14.0, 0,  0.00, @now, @now, @actor, @actor);

-- Artículos ----------------------------------------------------------------
INSERT INTO `article` (`id`, `version`, `name`, `brand`, `emoji`, `barcode`, `price`, `base_unit`, `recipe_unit`, `diary_unit`, `pack_unit`, `supermarket_id`, `category_id`, `nutrition_facts_id`, `aisle_id`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e30000-0000-4000-8000-000000000001', 1, 'E2E Yogur natural',     'Hacendado', '🥛', '8400000000011', 0.45, 'g',  'g', 'unit', 'pack', 'e2e10000-0000-4000-8000-000000000001', 'e2e20000-0000-4000-8000-000000000001', 'e2e50000-0000-4000-8000-000000000001', 'e2e60000-0000-4000-8000-000000000002', @now, @now, @actor, @actor),
  ('e2e30000-0000-4000-8000-000000000002', 1, 'E2E Pechuga de pollo',  'Hacendado', '🍗', '8400000000028', 6.90, 'g',  'g', 'g',    NULL,   'e2e10000-0000-4000-8000-000000000001', 'e2e20000-0000-4000-8000-000000000002', 'e2e50000-0000-4000-8000-000000000002', 'e2e60000-0000-4000-8000-000000000001', @now, @now, @actor, @actor),
  ('e2e30000-0000-4000-8000-000000000003', 1, 'E2E Arroz redondo',     'Brillante', '🍚', '8400000000035', 1.35, 'g',  'g', 'g',    'bag',  'e2e10000-0000-4000-8000-000000000001', NULL,                                   'e2e50000-0000-4000-8000-000000000003', 'e2e60000-0000-4000-8000-000000000003', @now, @now, @actor, @actor),
  ('e2e30000-0000-4000-8000-000000000004', 1, 'E2E Brócoli',           NULL,        '🥦', '8400000000042', 1.99, 'g',  'g', 'g',    NULL,   'e2e10000-0000-4000-8000-000000000002', 'e2e20000-0000-4000-8000-000000000003', 'e2e50000-0000-4000-8000-000000000004', 'e2e60000-0000-4000-8000-000000000004', @now, @now, @actor, @actor),
  ('e2e30000-0000-4000-8000-000000000005', 1, 'E2E Aceite de oliva',   'Hacendado', '🫒', '8400000000059', 8.45, 'ml', 'ml','tablespoon', 'carton', 'e2e10000-0000-4000-8000-000000000001', NULL,                              'e2e50000-0000-4000-8000-000000000005', 'e2e60000-0000-4000-8000-000000000003', @now, @now, @actor, @actor);

-- Equivalencias de unidad (1 yogur = 125 g, 1 cucharada = 10 ml) -----------
INSERT INTO `article_equivalence` (`id`, `version`, `article_id`, `unit`, `quantity`, `position`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e70000-0000-4000-8000-000000000001', 1, 'e2e30000-0000-4000-8000-000000000001', 'unit',       125, 0, @now, @now, @actor, @actor),
  ('e2e70000-0000-4000-8000-000000000002', 1, 'e2e30000-0000-4000-8000-000000000001', 'pack',       500, 1, @now, @now, @actor, @actor),
  ('e2e70000-0000-4000-8000-000000000003', 1, 'e2e30000-0000-4000-8000-000000000005', 'tablespoon',  10, 0, @now, @now, @actor, @actor),
  ('e2e70000-0000-4000-8000-000000000004', 1, 'e2e30000-0000-4000-8000-000000000003', 'bag',       1000, 0, @now, @now, @actor, @actor);

-- Stock de despensa --------------------------------------------------------
INSERT INTO `article_stock` (`id`, `version`, `article_id`, `quantity`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e61000-0000-4000-8000-000000000001', 1, 'e2e30000-0000-4000-8000-000000000002', 800, @now, @now, @actor, @actor),
  ('e2e61000-0000-4000-8000-000000000002', 1, 'e2e30000-0000-4000-8000-000000000003', 2000, @now, @now, @actor, @actor);

-- Recuentos de apertura del libro de movimientos ---------------------------
INSERT INTO `stock_movement` (`id`, `version`, `kind`, `ref_id`, `type`, `effective_at`, `quantity`, `original_quantity`, `original_unit`, `source_kind`, `source_id`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e62000-0000-4000-8000-000000000001', 1, 'article', 'e2e30000-0000-4000-8000-000000000002', 'count', '2020-01-01 00:00:00', 800, 800, NULL, 'manual', 'e2e30000-0000-4000-8000-000000000002', @now, @now, @actor, @actor),
  ('e2e62000-0000-4000-8000-000000000002', 1, 'article', 'e2e30000-0000-4000-8000-000000000003', 'count', '2020-01-01 00:00:00', 2000, 2000, NULL, 'manual', 'e2e30000-0000-4000-8000-000000000003', @now, @now, @actor, @actor);

-- Receta con ingredientes y pasos ------------------------------------------
INSERT INTO `recipe` (`id`, `version`, `name`, `emoji`, `category`, `servings`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e40000-0000-4000-8000-000000000001', 1, 'E2E Pollo con arroz', '🍛', 'Comida', 4, @now, @now, @actor, @actor);

INSERT INTO `recipe_ingredient` (`id`, `version`, `recipe_id`, `kind`, `ref_id`, `quantity`, `unit`, `position`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e41000-0000-4000-8000-000000000001', 1, 'e2e40000-0000-4000-8000-000000000001', 'product', 'e2e30000-0000-4000-8000-000000000002', 600, 'g',  0, @now, @now, @actor, @actor),
  ('e2e41000-0000-4000-8000-000000000002', 1, 'e2e40000-0000-4000-8000-000000000001', 'product', 'e2e30000-0000-4000-8000-000000000003', 320, 'g',  1, @now, @now, @actor, @actor),
  ('e2e41000-0000-4000-8000-000000000003', 1, 'e2e40000-0000-4000-8000-000000000001', 'product', 'e2e30000-0000-4000-8000-000000000004', 400, 'g',  2, @now, @now, @actor, @actor),
  ('e2e41000-0000-4000-8000-000000000004', 1, 'e2e40000-0000-4000-8000-000000000001', 'product', 'e2e30000-0000-4000-8000-000000000005',  30, 'ml', 3, @now, @now, @actor, @actor);

INSERT INTO `recipe_step` (`id`, `version`, `recipe_id`, `position`, `text`, `minutes`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e42000-0000-4000-8000-000000000001', 1, 'e2e40000-0000-4000-8000-000000000001', 0, 'Dorar la pechuga con el aceite.', 10, @now, @now, @actor, @actor),
  ('e2e42000-0000-4000-8000-000000000002', 1, 'e2e40000-0000-4000-8000-000000000001', 1, 'Añadir el arroz y el doble de agua.', 18, @now, @now, @actor, @actor),
  ('e2e42000-0000-4000-8000-000000000003', 1, 'e2e40000-0000-4000-8000-000000000001', 2, 'Incorporar el brócoli los últimos cinco minutos.', 5, @now, @now, @actor, @actor);

-- Objetivo nutricional del diario ------------------------------------------
-- OJO: `diary_goal` es un singleton con id fijo. `DoctrineDiaryGoalRepository`
-- lo busca por `DiaryGoal::SINGLETON_ID`, así que con un UUID cualquiera la
-- fila existe pero el diario nunca la encuentra y cae en los valores por
-- defecto (2100/130/70/250) sin dar ningún error.
INSERT INTO `diary_goal` (`id`, `version`, `calories`, `protein`, `fat`, `carbs`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('diary-goal', 1, 2200, 165, 70, 220, @now, @now, @actor, @actor);

-- Lista de la compra -------------------------------------------------------
-- La pantalla sólo pinta su `ds-split-view` cuando hay al menos un ítem: sin
-- estas filas los guards de layout y las capturas se harían contra el estado
-- vacío y no comprobarían nada del recorrido por pasillos.
INSERT INTO `shopping_list_item` (`id`, `version`, `article_id`, `custom_name`, `quantity`, `base_quantity`, `checked`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2e90000-0000-4000-8000-000000000001', 1, 'e2e30000-0000-4000-8000-000000000001', NULL, 2, 250,  0, @now, @now, @actor, @actor),
  ('e2e90000-0000-4000-8000-000000000002', 1, 'e2e30000-0000-4000-8000-000000000002', NULL, 1, 600,  0, @now, @now, @actor, @actor),
  ('e2e90000-0000-4000-8000-000000000003', 1, 'e2e30000-0000-4000-8000-000000000004', NULL, 1, 400,  1, @now, @now, @actor, @actor),
  ('e2e90000-0000-4000-8000-000000000004', 1, NULL, 'E2E Papel de cocina', 1, NULL, 0, @now, @now, @actor, @actor);

-- Diario del día congelado ---------------------------------------------------
-- La suite arranca el navegador el 2026-01-15 (src/support/clock.ts), así que
-- éste es "hoy" para el diario. Sin estas filas la pantalla sale vacía y las
-- capturas no verificarían el diseño de `ds-diary-entry`, que es de lo más
-- denso que tiene la app (emoji, macros, cantidad, unidad, badges).
SET @today = '2026-01-15';

INSERT INTO `diary_entry` (
  `id`, `version`, `entry_date`, `meal`, `kind`, `ref_id`, `production_item_id`,
  `quantity`, `unit`, `snapshot_name`, `snapshot_emoji`, `snapshot_calories`,
  `snapshot_protein`, `snapshot_fat`, `snapshot_carbs`,
  `quick_name`, `quick_emoji`, `quick_calories`, `quick_protein`, `quick_fat`, `quick_carbs`,
  `customized`, `consumed`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`
) VALUES
  ('e2ea0000-0000-4000-8000-000000000001', 1, @today, 'breakfast', 'product',
   'e2e30000-0000-4000-8000-000000000001', NULL, 1, 'unit',
   'E2E Yogur natural', '🥛', 76.25, 4.38, 4.13, 5.88,
   '', '', 0, 0, 0, 0, 0, 1, @now, @now, @actor, @actor),
  ('e2ea0000-0000-4000-8000-000000000002', 1, @today, 'lunch', 'product',
   'e2e30000-0000-4000-8000-000000000002', NULL, 150, 'g',
   'E2E Pechuga de pollo', '🍗', 180, 34.5, 3.9, 0,
   '', '', 0, 0, 0, 0, 0, 1, @now, @now, @actor, @actor),
  ('e2ea0000-0000-4000-8000-000000000003', 1, @today, 'snack', 'quick',
   NULL, NULL, 1, NULL,
   'E2E Café con leche', '☕', 90, 4.5, 3.5, 9,
   'E2E Café con leche', '☕', 90, 4.5, 3.5, 9, 0, 0, @now, @now, @actor, @actor);

-- Tickets de compra ----------------------------------------------------------
-- Un ticket llega del MCP con las líneas tal cual las imprime la caja. Una línea
-- sólo puede estar de dos maneras: vinculada —porque la memoria la conocía o
-- porque el catálogo reconoció el nombre— o esperando a que alguien diga qué es.
--
-- La memoria son estas mismas líneas: `normalized_name` —minúsculas, sin acentos,
-- espacios ni signos— es la clave por la que se busca, y la última línea con esa
-- clave que alguien vinculó a mano hace llegar vinculada a la siguiente.
--
-- `showcase` no lo toca ningún test: es el que fotografía la regresión visual.
-- Los `scratch` son de usar y tirar, uno por proyecto funcional, para que el
-- móvil y el escritorio no se pisen recepcionando el mismo ticket a la vez.
INSERT INTO `shopping_ticket` (`id`, `version`, `store_name`, `supermarket_id`, `purchased_on`, `total`, `note`, `status`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2eb0000-0000-4000-8000-000000000001', 1, 'E2E MERCADONA S.A.', 'e2e10000-0000-4000-8000-000000000001', '2026-01-14', 2.40, 'E2E compra semanal', 'draft', @now, @now, @actor, @actor),
  ('e2eb0000-0000-4000-8000-000000000002', 1, 'E2E MERCADONA S.A.', 'e2e10000-0000-4000-8000-000000000001', '2026-01-13', 2.40, '', 'draft', @now, @now, @actor, @actor),
  ('e2eb0000-0000-4000-8000-000000000003', 1, 'E2E MERCADONA S.A.', 'e2e10000-0000-4000-8000-000000000001', '2026-01-12', 2.40, '', 'draft', @now, @now, @actor, @actor),
  ('e2eb0000-0000-4000-8000-000000000004', 1, 'E2E MERCADONA S.A.', 'e2e10000-0000-4000-8000-000000000001', '2026-01-11', 2.40, '', 'draft', @now, @now, @actor, @actor),
  ('e2eb0000-0000-4000-8000-000000000005', 1, 'E2E MERCADONA S.A.', 'e2e10000-0000-4000-8000-000000000001', '2026-01-10', 2.40, '', 'draft', @now, @now, @actor, @actor);

INSERT INTO `shopping_ticket_item` (`id`, `version`, `ticket_id`, `position`, `raw_name`, `normalized_name`, `quantity`, `raw_unit`, `unit_price`, `total_price`, `article_id`, `link_source`, `article_name_snapshot`, `article_emoji_snapshot`, `pack_unit`, `pack_size`, `base_unit`, `base_quantity`, `received_at`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`) VALUES
  ('e2ec0000-0000-4000-8000-000000000011', 1, 'e2eb0000-0000-4000-8000-000000000001', 1, 'E2E YOGUR NAT. PACK', 'e2eyogurnatpack',  2, NULL, 0.45, 0.90, 'e2e30000-0000-4000-8000-000000000001', 'memory',  'E2E Yogur natural', '🥛', 'pack', 500, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000012', 1, 'e2eb0000-0000-4000-8000-000000000001', 2, 'E2E ARROZ RED. 1KG',  'e2earrozred1kg',   1, NULL, 1.35, 1.35, 'e2e30000-0000-4000-8000-000000000003', 'catalog', 'E2E Arroz redondo', '🍚', 'bag',  1000, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000013', 1, 'e2eb0000-0000-4000-8000-000000000001', 3, 'E2E BOLSA PLASTICO',  'e2ebolsaplastico', 1, NULL, 0.15, 0.15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000021', 1, 'e2eb0000-0000-4000-8000-000000000002', 1, 'E2E YOGUR NAT. PACK', 'e2eyogurnatpack',  2, NULL, 0.45, 0.90, 'e2e30000-0000-4000-8000-000000000001', 'memory',  'E2E Yogur natural', '🥛', 'pack', 500, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000022', 1, 'e2eb0000-0000-4000-8000-000000000002', 2, 'E2E ARROZ RED. 1KG',  'e2earrozred1kg',   1, NULL, 1.35, 1.35, 'e2e30000-0000-4000-8000-000000000003', 'catalog', 'E2E Arroz redondo', '🍚', 'bag',  1000, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000023', 1, 'e2eb0000-0000-4000-8000-000000000002', 3, 'E2E BOLSA PLASTICO',  'e2ebolsaplastico', 1, NULL, 0.15, 0.15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000031', 1, 'e2eb0000-0000-4000-8000-000000000003', 1, 'E2E YOGUR NAT. PACK', 'e2eyogurnatpack',  2, NULL, 0.45, 0.90, 'e2e30000-0000-4000-8000-000000000001', 'memory',  'E2E Yogur natural', '🥛', 'pack', 500, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000032', 1, 'e2eb0000-0000-4000-8000-000000000003', 2, 'E2E ARROZ RED. 1KG',  'e2earrozred1kg',   1, NULL, 1.35, 1.35, 'e2e30000-0000-4000-8000-000000000003', 'catalog', 'E2E Arroz redondo', '🍚', 'bag',  1000, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000033', 1, 'e2eb0000-0000-4000-8000-000000000003', 3, 'E2E BOLSA PLASTICO',  'e2ebolsaplastico', 1, NULL, 0.15, 0.15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000041', 1, 'e2eb0000-0000-4000-8000-000000000004', 1, 'E2E YOGUR NAT. PACK', 'e2eyogurnatpack',  2, NULL, 0.45, 0.90, 'e2e30000-0000-4000-8000-000000000001', 'memory',  'E2E Yogur natural', '🥛', 'pack', 500, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000042', 1, 'e2eb0000-0000-4000-8000-000000000004', 2, 'E2E BOLSA PLASTICO',  'e2ebolsaplastico', 1, NULL, 0.15, 0.15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000051', 1, 'e2eb0000-0000-4000-8000-000000000005', 1, 'E2E YOGUR NAT. PACK', 'e2eyogurnatpack',  2, NULL, 0.45, 0.90, 'e2e30000-0000-4000-8000-000000000001', 'memory',  'E2E Yogur natural', '🥛', 'pack', 500, 'g', 1000, NULL, @now, @now, @actor, @actor),
  ('e2ec0000-0000-4000-8000-000000000052', 1, 'e2eb0000-0000-4000-8000-000000000005', 2, 'E2E BOLSA PLASTICO',  'e2ebolsaplastico', 1, NULL, 0.15, 0.15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, @now, @now, @actor, @actor);
