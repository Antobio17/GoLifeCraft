import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

export const A11Y_BASELINE_PATH = resolve(HERE, "../../fixtures/a11y-baseline.json");

export const A11Y_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

export function readA11yBaseline(): Record<string, string[]> {
  return JSON.parse(readFileSync(A11Y_BASELINE_PATH, "utf8")) as Record<string, string[]>;
}
