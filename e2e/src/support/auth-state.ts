import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

export const AUTH_STATE_PATH = resolve(HERE, "../../.auth/user.json");

interface StorageState {
  origins: { origin: string; localStorage: { name: string; value: string }[] }[];
}

/**
 * El token del usuario semilla se emite una sola vez, en el proyecto `setup`.
 * Los tests que necesitan hablar con la API directamente (preparar o limpiar
 * datos) lo releen de ahí en vez de volver a hacer login: el firewall
 * `api_login` tiene throttling y varios workers en paralelo lo disparan.
 */
export function seededAuthToken(): string {
  const state = JSON.parse(readFileSync(AUTH_STATE_PATH, "utf8")) as StorageState;
  const token = state.origins
    .flatMap((origin) => origin.localStorage)
    .find((entry) => entry.name === "token")?.value;

  if (!token) {
    throw new Error(
      `No hay token en ${AUTH_STATE_PATH}. Ejecuta el proyecto "setup" antes.`,
    );
  }

  return token;
}
