import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Recarga la semilla antes de cada ejecución.
 *
 * Sin esto la suite es verde la primera vez y roja la segunda: los tests que
 * crean cosas (un artículo, una entrada del diario, un ítem de la compra) dejan
 * poso, y las cuentas exactas ("el catálogo tiene 5 artículos") empiezan a
 * fallar por datos de la ejecución anterior. Preferimos pagar unos segundos de
 * seed a escribir asserts laxos que no comprueban nada.
 *
 * Dentro del contenedor de Playwright no hay cliente de Docker, así que ahí se
 * salta: `scripts/docker-test.sh` espera que la semilla se haya cargado desde
 * el host, que es donde viven los contenedores.
 */
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
