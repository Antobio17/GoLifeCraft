import { Signal, computed, signal } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { UndoRequest } from "../../domain/models/undo-request.model";

const UNDO_WINDOW_MS = 5000;

export class UndoService {
  private readonly pending = signal<UndoRequest | null>(null);
  private window?: Subscription;
  private toastSequence = 0;

  readonly removedId: Signal<string | null> = computed(
    () => this.pending()?.id ?? null,
  );

  constructor(private readonly floatingToastService: FloatingToastService) {}

  schedule(request: UndoRequest): void {
    this.commitPending();

    this.pending.set(request);
    this.floatingToastService.showToast({
      status: 200,
      type: "info",
      keyTranslation: request.keyTranslation,
      details: request.details,
      durationMs: UNDO_WINDOW_MS,
      actionKeyTranslation: "floatingToast.undo",
      onAction: () => this.undo(),
    });
    this.toastSequence = this.floatingToastService.getSequence()();

    this.window = timer(UNDO_WINDOW_MS).subscribe(() => this.commitPending());
  }

  undo(): void {
    this.take();
  }

  withoutRemoved<T extends { id: string }>(items: T[]): T[] {
    const removedId = this.removedId();
    if (!removedId) return items;

    return items.filter((item) => item.id !== removedId);
  }

  commitPending(): void {
    const request = this.take();
    if (!request) return;

    request.commit();
  }

  dispose(): void {
    this.commitPending();
  }

  private take(): UndoRequest | null {
    const request = this.pending();
    if (!request) return null;

    this.window?.unsubscribe();
    this.pending.set(null);
    this.dismissOwnToast();

    return request;
  }

  private dismissOwnToast(): void {
    if (this.floatingToastService.getSequence()() !== this.toastSequence)
      return;

    this.floatingToastService.dismiss();
  }
}
