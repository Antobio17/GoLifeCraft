#!/usr/bin/env node
/**
 * Enforcement de la escala del design system.
 *
 * font-size, gap, padding, margin y border-radius sólo pueden usar los tokens
 * declarados en shared/design-system/tokens/. Un literal de longitud en esas
 * propiedades es un error, salvo que esté en EXCEPTIONS.
 *
 * Cubre los tres sitios donde vive CSS en este repo:
 *   - ficheros .css
 *   - `styles: [` ... `]` inline en .ts, y objetos de estilo imperativos
 *   - bindings de plantilla en .html ([gap]="'…'", padding="…", radius="…")
 *
 * Guardas (no son violaciones, no deben escalar con --ds-root-font-size):
 *   - condiciones de @media: son breakpoints
 *   - longitudes < 3px: bordes y hairlines
 *   - --ds-radius-pill: 9999px es un sentinel, no un paso de escala
 *   - rootMargin de ds-infinite-scroll y minWidth de ListColumn viven fuera
 *     de CSS, así que este checker no los mira
 *   - env(safe-area-inset-*): píxeles físicos del dispositivo
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "src");
const TOKENS_DIR = join(ROOT, "app/shared/design-system/tokens");

const FAMILIES = {
  typography: {
    props: ["font-size"],
    prefix: "--ds-text-",
    camel: ["fontSize"],
    attrs: [],
  },
  radius: {
    props: [
      "border-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-left-radius",
      "border-bottom-right-radius",
    ],
    prefix: "--ds-radius-",
    camel: ["borderRadius"],
    attrs: ["radius"],
  },
  spacing: {
    props: [
      "padding",
      "margin",
      "gap",
      "row-gap",
      "column-gap",
      "scroll-padding-inline",
      "scroll-padding-block",
    ],
    prefix: "--ds-space-",
    camel: ["padding", "margin", "gap"],
    attrs: ["gap", "padding", "margin", "rowGap", "columnGap"],
  },
};
// padding-top, margin-inline-start, etc.
const SIDES = ["top", "right", "bottom", "left", "block", "inline"];
for (const side of SIDES) {
  FAMILIES.spacing.props.push(`padding-${side}`, `margin-${side}`);
  for (const edge of ["start", "end"]) {
    FAMILIES.spacing.props.push(
      `padding-${side}-${edge}`,
      `margin-${side}-${edge}`,
    );
  }
}

/**
 * One-off deliberados. Son geometría de un componente concreto, no pasos de
 * escala: forzarlos a la escala es justo el error que este checker evita.
 * Añadir aquí exige una decisión consciente — que es el punto.
 *
 * `min` acota la excepción a valores por encima de ese umbral en px, para que
 * exentar un offset de layout no abra la puerta a literales pequeños nuevos
 * en el mismo fichero.
 */
const EXCEPTIONS = [
  {
    file: "design-system/product-hero",
    props: ["font-size"],
    why: "glifo emoji del hero, no es texto",
  },
  {
    file: "design-system/auth-card",
    props: ["padding", "padding-right", "column-gap"],
    min: 36,
    why: "layout de dos columnas en escritorio",
  },
  {
    file: "design-system/form-input",
    props: ["padding-left", "padding-right"],
    min: 36,
    why: "hueco para el icono y el prefijo del input",
  },
  {
    file: "design-system/page-header",
    props: ["padding-left", "padding-right"],
    min: 36,
    why: "offset de la sidebar fija",
  },
  {
    file: "design-system/skeleton/",
    props: ["padding-left", "padding-right"],
    min: 36,
    why: "espeja los offsets de page-header",
  },
  {
    file: "design-system/activity-heatmap",
    props: ["--ds-heat-gap", "--ds-heat-cell", "--ds-heat-radius"],
    why: "geometría interna de la rejilla del heatmap: la celda mide 12px, así que su radio se mide contra la celda y no contra la escala",
  },
  {
    file: "layouts/layout/main",
    props: ["padding-bottom"],
    min: 36,
    why: "hueco para la bottom-nav, es un offset de layout",
  },
  {
    file: "design-system/dashboard-layout",
    props: ["padding"],
    min: 36,
    why: "respiro del dashboard en escritorio",
  },
  {
    file: "design-system/page-wrapper",
    props: ["padding"],
    min: 36,
    why: "respiro de página en escritorio",
  },
  {
    file: "design-system/empty-state",
    props: ["padding"],
    min: 36,
    why: "aire vertical del estado vacío, por encima de la escala",
  },
  {
    file: "design-system/list-table",
    props: ["padding"],
    min: 36,
    why: "aire vertical del estado vacío, por encima de la escala",
  },
];

const LEN = /(-?\d*\.?\d+)(rem|px)(?![\w-])/g;
const DECL = /(?<![-\w:])((?:--)?[a-z][\w-]*)\s*:\s*([^;{}]*)/g;

const violations = [];
const files = [];

(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".angular") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(css|ts|html)$/.test(p)) files.push(p);
  }
})(ROOT);

/** Tokens realmente declarados, para cazar referencias a tokens muertos. */
const declared = new Set();
for (const f of readdirSync(TOKENS_DIR)) {
  for (const m of readFileSync(join(TOKENS_DIR, f), "utf8").matchAll(
    /^\s*(--ds-[\w-]+)\s*:/gm,
  ))
    declared.add(m[1]);
}

const familyOf = (prop) =>
  Object.entries(FAMILIES).find(([, f]) => f.props.includes(prop))?.[0];

function exempt(rel, prop, px) {
  return EXCEPTIONS.some(
    (e) =>
      rel.includes(e.file) &&
      e.props.includes(prop) &&
      (e.min === undefined || Math.abs(px) >= e.min),
  );
}

/** Enmascara preludios de @media conservando offsets: los breakpoints son px. */
const maskMedia = (css) =>
  css.replace(/@media[^{]*/g, (m) => m.replace(/[^\n]/g, " "));

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

function report(file, text, index, prop, raw, hint) {
  violations.push({
    file: relative(join(ROOT, ".."), file),
    line: lineOf(text, index),
    prop,
    raw,
    hint,
  });
}

/** Regiones CSS de un fichero: [start, end] sobre el texto original. */
function cssRegions(path, text) {
  if (path.endsWith(".css")) return [[0, text.length]];
  if (!path.endsWith(".ts")) return [];
  const out = [];
  for (const m of text.matchAll(/styles\s*:\s*\[?/g)) {
    let i = m.index + m[0].length;
    while (i < text.length) {
      const ch = text[i];
      if (ch === "`") {
        let j = i + 1;
        while (j < text.length && text[j] !== "`")
          j += text[j] === "\\" ? 2 : 1;
        out.push([i + 1, j]);
        i = j + 1;
        continue;
      }
      if (ch === "]" || ch === "," || ch === "}") break;
      i++;
    }
  }
  return out;
}

function checkLengths(path, text, offset, prop, value, valueStart, reported) {
  const rel = relative(ROOT, path).split(sep).join("/");
  const family = familyOf(prop);
  if (!family) return;
  const label = reported ?? prop;
  for (const lm of value.matchAll(LEN)) {
    const px = parseFloat(lm[1]) * (lm[2] === "rem" ? 16 : 1);
    if (px === 0 || Math.abs(px) < 3) continue; // hairlines
    if (exempt(rel, prop, px) || exempt(rel, label, px)) continue;
    report(
      path,
      text,
      offset + valueStart + lm.index,
      label,
      lm[0],
      `usa un token ${FAMILIES[family].prefix}*`,
    );
  }
}

for (const path of files) {
  const text = readFileSync(path, "utf8");
  const rel = relative(ROOT, path).split(sep).join("/");
  const isTokenFile = rel.startsWith("app/shared/design-system/tokens/");

  // 1) CSS: ficheros .css y bloques styles: de .ts
  if (!isTokenFile) {
    for (const [s, e] of cssRegions(path, text)) {
      const css = maskMedia(text.slice(s, e));

      // Un custom prop local hereda la familia de la propiedad que lo consume,
      // para que declararlo no sea una vía de escape a la escala.
      const local = new Map();
      for (const m of css.matchAll(DECL)) {
        const fam = familyOf(m[1]);
        if (!fam) continue;
        for (const v of m[2].matchAll(/var\(\s*(--[\w-]+)/g))
          local.set(v[1], FAMILIES[fam].props[0]);
      }

      for (const m of css.matchAll(DECL)) {
        const prop = local.get(m[1]) ?? m[1];
        checkLengths(
          path,
          text,
          s,
          prop,
          m[2],
          m.index + m[0].indexOf(m[2]),
          m[1],
        );
      }
    }
  }

  // 2) objetos de estilo imperativos y defaults @Input en .ts
  if (path.endsWith(".ts")) {
    const camel = Object.entries(FAMILIES).flatMap(([, f]) =>
      f.camel.map((c) => [c, f]),
    );
    for (const [name, fam] of camel) {
      const re = new RegExp(`\\b${name}\\s*[:=]\\s*"([^"]*)"`, "g");
      for (const m of text.matchAll(re)) {
        const prop = fam.props[0];
        for (const lm of m[1].matchAll(LEN)) {
          const px = parseFloat(lm[1]) * (lm[2] === "rem" ? 16 : 1);
          if (px === 0 || Math.abs(px) < 3) continue;
          if (exempt(rel, prop, px)) continue;
          report(
            path,
            text,
            m.index + m[0].indexOf(m[1]) + lm.index,
            name,
            lm[0],
            `usa un token ${fam.prefix}*`,
          );
        }
      }
    }
  }

  // 3) bindings de plantilla en .html
  if (path.endsWith(".html")) {
    const attrs = Object.entries(FAMILIES).flatMap(([, f]) =>
      f.attrs.map((a) => [a, f]),
    );
    for (const [name, fam] of attrs) {
      const re = new RegExp(`\\[?${name}\\]?="'?([^"']*)'?"`, "g");
      for (const m of text.matchAll(re)) {
        for (const lm of m[1].matchAll(LEN)) {
          const px = parseFloat(lm[1]) * (lm[2] === "rem" ? 16 : 1);
          if (px === 0 || Math.abs(px) < 3) continue;
          if (exempt(rel, fam.props[0], px)) continue;
          report(
            path,
            text,
            m.index + m[0].indexOf(m[1]) + lm.index,
            name,
            lm[0],
            `usa un token ${fam.prefix}*`,
          );
        }
      }
    }
  }

  // 4) referencias a tokens de escala inexistentes
  for (const m of text.matchAll(
    /var\(\s*(--ds-(?:text|space|radius)-[\w-]+)/g,
  )) {
    if (declared.has(m[1])) continue;
    report(path, text, m.index, "var()", m[1], "ese token no existe");
  }
}

if (violations.length === 0) {
  console.log(
    "check-design-tokens: escala respetada en " + files.length + " ficheros.",
  );
  process.exit(0);
}

console.error(`check-design-tokens: ${violations.length} violación(es)\n`);
for (const v of violations)
  console.error(
    `  ${v.file}:${v.line}\n    ${v.prop}: ${v.raw}  ->  ${v.hint}`,
  );
console.error(
  "\nLa escala vive en src/app/shared/design-system/tokens/.\n" +
    "Si el valor es geometría one-off de un componente, añádelo a EXCEPTIONS\n" +
    "en tools/check-design-tokens.mjs con su motivo.",
);
process.exit(1);
