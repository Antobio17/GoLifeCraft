import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

export const APP_DIR = resolve(HERE, "../../../frontend/src/app");

export const BASELINE_PATH = resolve(HERE, "../../fixtures/native-tags-baseline.json");

const ALLOWED = new Set(["form"]);

const HTML_TAGS = new Set(
  `a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code
   col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer
   form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map
   mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby
   s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th
   thead time title tr track u ul var video wbr svg path circle rect line polyline polygon g defs clipPath mask
   use tspan ellipse foreignObject stop linearGradient radialGradient`
    .split(/\s+/)
    .filter((tag) => tag && !ALLOWED.has(tag)),
);

const TAG = /<([a-zA-Z][a-zA-Z0-9-]*)/g;

function templates(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      if (entry !== "node_modules") {
        templates(full, found);
      }
      continue;
    }

    if (entry.endsWith(".html")) {
      found.push(full);
    }
  }

  return found;
}

export function countNativeTags(): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const file of templates(APP_DIR)) {
    const path = relative(APP_DIR, file).split("\\").join("/");

    if (path.startsWith("shared/design-system/")) {
      continue;
    }

    const source = readFileSync(file, "utf8");
    let total = 0;

    for (const match of source.matchAll(TAG)) {
      if (HTML_TAGS.has(match[1])) {
        total += 1;
      }
    }

    if (total > 0) {
      counts[path] = total;
    }
  }

  return counts;
}

export function readBaseline(): Record<string, number> {
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as Record<string, number>;
}
