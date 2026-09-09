/**
 * Todas las pantallas que pintan "hoy" (diario, agenda, dashboard) cambian de
 * aspecto cada día. Fijamos la fecha de arranque del navegador para que la
 * captura de ayer siga siendo válida mañana.
 *
 * OJO con congelar `Date`: `page.clock.setFixedTime()` deja `Date.now()` clavado
 * y eso rompe TODOS los `debounceTime` de la app. La razón está en RxJS: su
 * `debounceTime` compara `scheduler.now()` (que es `Date.now()`) contra el
 * instante en que llegó el último valor y, si no ha pasado el tiempo, se
 * reprograma. Con el reloj parado ese "todavía no" es para siempre y la
 * búsqueda del catálogo, la del diario y la del recetario no llegan a lanzarse
 * nunca — el test se queda esperando una petición que no va a salir.
 *
 * Por eso instalamos el reloj falso y acto seguido lo dejamos correr: la fecha
 * de partida es determinista, pero el tiempo avanza y los timers funcionan.
 */
import { Page } from "@playwright/test";

export const FIXED_DATE = new Date("2026-01-15T09:00:00.000Z");

export async function startClockAt(page: Page, time: Date = FIXED_DATE): Promise<void> {
  await page.clock.install({ time });
  await page.clock.resume();
}
