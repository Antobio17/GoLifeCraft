import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_SKIP_SEED === "1") {
    console.log("▸ Semilla omitida (E2E_SKIP_SEED=1).");
    return;
  }

  const seed = resolve(HERE, "../../scripts/seed.sh");

  try {
    execFileSync("docker", ["version"], { stdio: "ignore" });
  } catch {
    console.warn(
      "⚠ No hay cliente de Docker: la semilla no se recarga. Lánzala desde el host con `npm run seed`.",
    );
    return;
  }

  execFileSync(seed, [], { stdio: "inherit" });
}
