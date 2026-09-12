# e2e — pruebas end to end y de diseño

Tercer módulo del monorepo, al mismo nivel que `backend/` y `frontend/`. Comprueba
dos cosas distintas con la misma infraestructura:

1. **Que la app funciona**: flujos reales contra la API y la base de datos de verdad.
2. **Que el diseño no se rompe**: que todo sigue en la posición que le toca.

---

## Puesta en marcha

```bash
cd e2e
npm ci
npx playwright install chromium     # sólo la primera vez
```

Hace falta tener levantados los contenedores (`make up` en la raíz) y el front:

```bash
cd frontend && npm start            # http://localhost:4200
```

## Lanzar las pruebas

```bash
npm test                    # flujos + guards de diseño + accesibilidad (en tu máquina)
npm run test:visual         # regresión visual, en Docker (ver más abajo)
npm run test:all            # las dos cosas, en orden

npm run test:functional     # sólo los flujos, escritorio y móvil
npm run test:guards         # sólo los invariantes de layout y design system
npm run test:a11y           # sólo accesibilidad
npm run report              # abre el informe HTML de la última ejecución
```

`npm test` deja fuera la regresión visual a propósito: sus capturas sólo valen
si se sacan en el contenedor, así que en el host fallarían todas por el
antialiasing de las fuentes.

La semilla se recarga sola antes de cada ejecución (`globalSetup`). Para saltártela
en una tanda rápida: `E2E_SKIP_SEED=1 npm test`.

## Las cuatro capas

| Capa                 | Fichero                                                 | Qué vigila                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flujos**           | junto a cada módulo (`src/nutrition/catalog/article/`…) | Que login, catálogo, recetario, diario y lista de la compra hacen lo que dicen, en escritorio y en móvil                                                                                                                   |
| **Navegación**       | `src/navigation/back-navigation.spec.ts`                | Que el botón de atrás devuelve a la pantalla de la que se vino, y que con un enlace directo cae en su listado en vez de salirse de la app                                                                                  |
| **Layout**           | `src/design/layout.spec.ts`                             | Sin píxeles: cero scroll horizontal, la barra lateral entra a 768px y la inferior se va, el `ds-split-view` pasa de una a dos columnas a 1000px y su lateral es sticky, el contenido no queda tapado por la barra inferior |
| **Design system**    | `src/design/design-system.spec.ts`                      | Que no aparezcan etiquetas HTML nativas fuera de `shared/design-system`, que no se cuelen claves de traducción sin traducir, y que los tokens `--ds-*` resuelvan en claro y en oscuro                                      |
| **Regresión visual** | `src/design/visual-regression.spec.ts`                  | Captura pixel a pixel de cada pantalla en móvil y escritorio, en tema claro y oscuro                                                                                                                                       |
| **Accesibilidad**    | `src/design/accessibility.spec.ts`                      | Que no aparezca una clase nueva de fallo WCAG 2.1 AA                                                                                                                                                                       |

Layout y design system son los que de verdad te van a servir en el día a día: no
hay que regenerarlos cuando cambia un color y, cuando fallan, dicen **qué** se ha
roto en vez de "hay 4000 píxeles distintos".

## Regresión visual: siempre en Docker

```bash
npm run test:visual         # compara contra los snapshots
npm run update-snapshots    # los regenera (revisa el diff antes de commitear)
```

Las capturas se sacan dentro del contenedor oficial de Playwright, clavado a la
versión de `@playwright/test` **realmente instalada** (`node_modules`, no el
rango del `package.json`): una imagen con navegadores de otra versión ni
arranca, y una más nueva reescribiría todos los snapshots. Por eso la
dependencia va con versión exacta, sin `^`.

Van en dos tandas por una limitación de las capturas de página completa: los
elementos `position: fixed` se pintan una sola vez, donde estaban en el viewport
inicial, así que la barra inferior salía incrustada a media página tapando
contenido que entonces no se comprobaba nunca.

- **pantallas del núcleo** — página entera, sin el armazón fijo.
- **armazón** — sólo el viewport, sin scroll, con las barras a la vista.

Los 32 PNG viven en `snapshots/` y se versionan: son el contrato.

## Trinquetes de deuda

Dos reglas no se pueden cumplir hoy al 100%, así que en vez de desactivarlas se
congela lo que hay y se impide que crezca:

- `fixtures/native-tags-baseline.json` — etiquetas HTML nativas por template.
  Al limpiar deuda, `npm run baseline:native-tags`.
- `fixtures/a11y-baseline.json` — reglas WCAG que incumple cada pantalla.
  Al limpiar deuda, `npm run baseline:a11y`.

Los dos tests fallan tanto si la deuda sube como si baja sin actualizar el
fichero. Es a propósito: es la única forma de que el listón no vuelva a subir.

### Pantalla nueva: `npm run adopt`

Una pantalla recién dada de alta falla a la primera en tres sitios (sin
snapshots, fuera del baseline de accesibilidad, quizá con etiquetas nativas).
`npm run adopt` recorre los tres y enseña qué cambió.

**Sólo para pantallas nuevas.** Si falla una que ya existía, el fallo es la
información: alguien movió un pixel o empeoró un contraste, y adoptar el
baseline borra justo lo que había que mirar. Con las etiquetas nativas ni
siquiera hay decisión — `adopt` revierte solo y avisa si intentas subirlas.

## Datos de prueba

Todo vive en el tenant `GLCE2E000001` y el usuario `e2e@golifecraft.test`. Nunca
se toca la base de datos de desarrollo.

```bash
npm run seed          # recarga las filas
npm run seed:reset    # además tira y recrea la base del tenant
```

El **esquema no se versiona en SQL**: lo genera Doctrine (`app:tenant:schema-update`).
`fixtures/sql/` sólo mete filas, y `src/support/seed-data.ts` es su espejo en
TypeScript — ningún test escribe un UUID a mano.

## Estructura

`src/` espeja el árbol `context/subcontext/module` del **frontend** (no el del
backend: los dos no coinciden en `authorization`, y como estos tests conducen la
UI el mapa útil es el del front). Tocas una pantalla y su prueba está en la misma
ruta:

```
frontend/src/app/nutrition/catalog/article/   →   e2e/src/nutrition/catalog/article/
```

Dentro de cada módulo conviven el page object y el spec, en plano:

```
src/
├── authorization/login/login/       login.page.ts · login.spec.ts
├── nutrition/catalog/article/       articles.page.ts · article.page.ts
│                                    article-editor.page.ts · articles.spec.ts
├── nutrition/recipe/recipe/
├── nutrition/diary/diary/
├── nutrition/shopping/shopping/
├── design/                          ← transversal: no es de ningún módulo
├── navigation/                      ← transversal: abrir fichas y volver atrás
├── setup/                           ← emite la sesión semilla
└── support/                         ← reloj, gestos, autosave, ds, semilla
```

**Aquí no se hace hexagonal, y es deliberado.** Los puertos existen para poder
cambiar la implementación sin tocar el dominio; en una suite end to end no hay
nada que sustituir — el navegador, la API y la base de datos reales _son_ el
objeto de la prueba. Un puerto con una única implementación que nunca tendrá
otra es ceremonia sin contrapartida.

Lo que sí hay es separación de responsabilidades:

| Pieza                        | Papel                        | Regla                              |
| ---------------------------- | ---------------------------- | ---------------------------------- |
| `*.spec.ts`                  | Qué se comprueba             | No sabe de selectores              |
| `*.page.ts`                  | Cómo se opera la pantalla    | No lleva asserts de negocio        |
| `support/`                   | Infraestructura compartida   | No sabe de pantallas concretas     |
| `fixtures/` + `seed-data.ts` | Los datos y su espejo tipado | Ningún test escribe un UUID a mano |

`design/`, `navigation/` y `setup/` quedan fuera del árbol de módulos a
propósito: los guards de layout no pertenecen a ningún bounded context, y saltar
de una pantalla a la ficha de otra tampoco — comprueban el armazón que los cruza
todos.

## Selectores

Los `data-testid` van siempre en el host `<ds-*>`, que es lo único que la
plantilla puede tocar sin saltarse la regla de "nada de etiquetas nativas". Los
helpers de `src/support/ds.ts` bajan de ahí al `<input>`, `<select>` o `<button>`
real.

## Trampas que ya nos han mordido

Están documentadas en el código, pero conviene tenerlas a mano:

- **No congeles `Date`.** `page.clock.setFixedTime()` rompe todos los
  `debounceTime` de RxJS y ninguna búsqueda de la app llega a lanzarse. Se
  instala el reloj y se deja correr (`src/support/clock.ts`).
- **Los sheets se portean al `<body>`**, no quedan dentro de `ds-modal-sheet`:
  se buscan por clase (`src/support/ds.ts`).
- **Borrar es un gesto**, no un click: el botón de la papelera vive debajo de la
  fila (`src/support/gestures.ts`).
- **El diario y la compra se autoguardan** con 400 ms de retardo: navegar antes
  pierde el cambio (`src/support/autosave.ts`).
- **Un ítem custom de la compra nace con id optimista** (`pending-…`); tocarlo
  antes de que vuelva el POST manda la escritura contra un id que no existe.
- **`diary_goal` es un singleton con id fijo** `'diary-goal'`: con un UUID
  cualquiera la fila existe pero el diario cae en sus valores por defecto.
- **`docker run -it` revienta sin terminal** (CI, o lanzado por un agente): el
  `-t` va condicionado a `[ -t 0 ]`.
- **`testMatch` y `testIgnore` NO son relativos a `testDir`**: se aplican sobre
  la ruta absoluta del fichero. Un patrón anclado con `^` no casa con nada y
  deja los guards sin ejecutar mientras los proyectos funcionales se los tragan
  por duplicado — y todo sigue "en verde".
