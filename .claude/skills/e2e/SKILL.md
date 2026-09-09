---
name: e2e
description: Verifica el frontend con la suite de e2e/ (Playwright) y mantiene sus capturas y baselines. Decide sola qué hay que correr según lo que se haya tocado, levanta lo que falte del entorno e interpreta los fallos — sobre todo los de regresión visual, que hay que mirar antes de regenerar nada. Úsala SIEMPRE al terminar un cambio en frontend/src/app, aunque nadie la pida, y también cuando se cree una pantalla nueva o el usuario pregunte por los tests, las capturas o los snapshots.
---

# Verificar el frontend y mantener sus capturas

La suite vive en `e2e/` y comprueba dos cosas: que la app funciona y que **el
diseño no se rompe**. El detalle está en `e2e/README.md`; aquí está sólo lo que
hay que decidir.

Al usuario le importa especialmente que todo siga en la posición que le toca.
Un fallo visual no es una molestia que quitar de en medio: es el hallazgo.

## 1. Comprobar el entorno antes de nada

La suite necesita tres cosas. Comprobarlas y levantar lo que falte, sin dar por
hecho que están:

```bash
docker ps --format '{{.Names}}' | grep golifecraft   # mysql, php, nginx
curl -sf -o /dev/null http://localhost:4200 && echo "front OK"
```

- Faltan contenedores → `make up` en la raíz.
- Falta el front → arrancarlo **en segundo plano** (`cd frontend && npm start`) y
  esperar al puerto con un `until curl -sf ...; do sleep 2; done`. Nunca en
  primer plano: bloquea la sesión.

La semilla se recarga sola en cada ejecución; no hay que lanzarla a mano.

## 2. Elegir qué correr

Mirar qué ha cambiado (`git status --porcelain`) y decidir:

| Lo que se ha tocado | Qué correr |
|---|---|
| Un template, CSS o componente de `frontend/src/app/**` | `npm test` **y** `npm run test:visual` |
| Sólo backend, sin efecto en pantalla | Nada de esto; los tests del backend |
| Pantalla nueva | Ver el apartado 4 |
| Sólo ficheros de `e2e/` | Lo que cubra el cambio, y `npx tsc --noEmit` |

```bash
cd e2e
npm test              # flujos + guards de layout/design system + a11y (~2,5 min)
npm run test:visual   # regresión visual, en Docker (~1 min)
```

`npm test` deja fuera lo visual a propósito: esas capturas sólo valen si se
sacan en el contenedor.

## 3. Interpretar los fallos

**Esto es lo que no se puede hacer con el piloto automático.**

### Falla la regresión visual

Nunca regenerar sin mirar. Abrir el comparador y ver qué se movió:

```bash
cd e2e && npm run report
```

- **El cambio es el que se buscaba** → `npm run update-snapshots`, y los PNG van
  en el mismo commit que el código. Decirle al usuario **qué pantallas**
  cambiaron y en qué.
- **El cambio no se esperaba** → es una regresión. Arreglarla. No regenerar.
- **Duda** → no regenerar. Enseñarle las capturas que cambiaron y preguntar.

> Regenerar capturas para silenciar un fallo que no se ha entendido destruye lo
> único que hace útil esta capa, y lo hace en silencio.

### Falla el guard de etiquetas nativas

Aquí no hay decisión: alguien metió un `<div>`, `<span>` o `<button>` fuera de
`shared/design-system`. Se crea el componente `<ds-*>` que falta. **El baseline
de etiquetas nativas sólo baja, nunca sube** (`<form>` es la única excepción, ya
contemplada).

### Falla un guard de layout

Dicen qué se rompió, no hace falta interpretar píxeles: desbordes horizontales,
la barra lateral fuera de su umbral de 768px, el `ds-split-view` sin partir a
1000px, contenido tapado por la barra inferior. Se arregla el CSS.

### Falla accesibilidad

Ha aparecido una **clase nueva** de fallo WCAG (un botón de icono sin nombre, un
`aria` roto). Se arregla; no se adopta el baseline.

### Los tests fallan sin haber tocado nada relacionado

Antes de investigar el código, comprobar que no es entorno: contenedores caídos,
el front sin arrancar, o la sesión caducada. La suite sabe decirlo — el setup
falla con "¿Has ejecutado npm run seed?" cuando el login no va.

## 4. Pantalla nueva

Orden importa:

1. `data-testid` en los hosts `<ds-*>` de las acciones y campos. **Nunca en una
   etiqueta nativa**; los helpers de `e2e/src/support/ds.ts` bajan al control real.
2. Alta en `e2e/src/support/routes.ts` → `CORE_SCREENS` (y `SPLIT_VIEW_SCREENS`
   si usa `ds-split-view`). Con eso entra sola en guards de layout, accesibilidad
   y regresión visual. El `ready` tiene que ser un elemento que sólo exista
   cuando la pantalla ha cargado: `ds-page-wrapper` no vale, existe también
   mientras se ven los skeletons.
3. Page object y spec en `e2e/src/{context}/{subcontext}/{module}/`, **misma ruta
   que en el frontend**.
4. Si necesita datos: filas en `e2e/fixtures/sql/10-tenant-data.sql` y su espejo
   en `e2e/src/support/seed-data.ts`.
5. Adoptar los tres baselines de golpe:

```bash
cd e2e && npm run adopt
```

`adopt` es **sólo para pantallas nuevas**. Para una que ya existía, el fallo es
información: ver el apartado 3.

## 5. Al terminar, contarlo

Decir siempre qué se ejecutó y cómo fue. Si se regeneraron capturas, decir
cuáles y por qué. Si algo se dejó sin correr (por ejemplo, no había Docker para
lo visual), decirlo en vez de dejarlo pasar.
