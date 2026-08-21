import { Signal, computed, signal } from "@angular/core";
import { Observable, Subject, Subscription, of, take, timer } from "rxjs";
import { AutosaveStatus } from "../../domain/models/autosave-status.model";
import { AutosaveTask } from "../../domain/models/autosave-task.model";

const DEBOUNCE_MS = 400;
const SAVED_VISIBLE_MS = 2200;

export class AutosaveService {
  private readonly queued = new Map<string, AutosaveTask>();
  private readonly timers = new Map<string, Subscription>();
  private readonly running = new Map<string, Subscription>();
  private readonly failures = new Map<string, AutosaveTask>();

  private readonly queuedCount = signal(0);
  private readonly runningCount = signal(0);
  private readonly failureCount = signal(0);
  private readonly recentlySaved = signal(false);

  private readonly settled = new Subject<void>();
  private savedTimer?: Subscription;
  private disposed = false;

  readonly status: Signal<AutosaveStatus> = computed(() => {
    if (this.failureCount() > 0) return AutosaveStatus.Error;
    if (this.queuedCount() > 0 || this.runningCount() > 0) {
      return AutosaveStatus.Saving;
    }
    if (this.recentlySaved()) return AutosaveStatus.Saved;

    return AutosaveStatus.Idle;
  });

  readonly hasPendingWork: Signal<boolean> = computed(
    () => this.queuedCount() + this.runningCount() > 0,
  );

  readonly hasFailures: Signal<boolean> = computed(
    () => this.failureCount() > 0,
  );

  push(key: string, task: AutosaveTask): void {
    if (this.disposed) return;

    this.failures.delete(key);
    this.queued.set(key, task);
    this.timers.get(key)?.unsubscribe();
    this.timers.set(
      key,
      timer(DEBOUNCE_MS).subscribe(() => this.dispatch(key)),
    );

    this.clearSavedFlag();
    this.syncCounters();
  }

  flush(): Observable<void> {
    if (this.disposed) return of(void 0);

    this.timers.forEach((subscription) => subscription.unsubscribe());
    this.timers.clear();
    [...this.queued.keys()].forEach((key) => this.dispatch(key));

    if (!this.hasPendingWork()) return of(void 0);

    return this.settled.pipe(take(1));
  }

  retry(): void {
    if (this.disposed) return;

    const pending = [...this.failures.entries()];
    this.failures.clear();
    pending.forEach(([key, task]) => this.queued.set(key, task));
    this.syncCounters();

    pending.forEach(([key]) => this.dispatch(key));
  }

  /**
   * Al salir de la pantalla se envía lo que el debounce aún no había mandado, y las
   * peticiones en vuelo se dejan terminar: cancelarlas tiraría un cambio ya hecho.
   */
  dispose(): void {
    this.flush();

    this.disposed = true;
    this.savedTimer?.unsubscribe();
    this.timers.forEach((subscription) => subscription.unsubscribe());
    this.timers.clear();
    this.failures.clear();
    this.syncCounters();
  }

  private dispatch(key: string): void {
    this.timers.get(key)?.unsubscribe();
    this.timers.delete(key);

    if (this.running.has(key)) return;

    const task = this.queued.get(key);
    if (!task) return;

    this.queued.delete(key);
    this.syncCounters();

    const subscription = task().subscribe({
      next: () => undefined,
      error: () => this.onFailure(key, task),
      complete: () => this.onSuccess(key),
    });

    if (subscription.closed) return;

    this.running.set(key, subscription);
    this.syncCounters();
  }

  private onSuccess(key: string): void {
    this.running.delete(key);
    this.syncCounters();

    if (this.queued.has(key)) {
      this.dispatch(key);

      return;
    }

    this.markSettled();
  }

  private onFailure(key: string, task: AutosaveTask): void {
    this.running.delete(key);
    this.failures.set(key, task);
    this.syncCounters();
    this.markSettled();
  }

  private markSettled(): void {
    if (this.hasPendingWork()) return;

    this.settled.next();

    if (this.hasFailures()) return;

    this.recentlySaved.set(true);
    this.savedTimer?.unsubscribe();
    this.savedTimer = timer(SAVED_VISIBLE_MS).subscribe(() =>
      this.recentlySaved.set(false),
    );
  }

  private clearSavedFlag(): void {
    this.savedTimer?.unsubscribe();
    this.recentlySaved.set(false);
  }

  private syncCounters(): void {
    this.queuedCount.set(this.queued.size);
    this.runningCount.set(this.running.size);
    this.failureCount.set(this.failures.size);
  }
}
