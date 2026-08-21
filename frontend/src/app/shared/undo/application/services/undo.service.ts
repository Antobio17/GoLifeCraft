import { Signal, signal } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { UndoRequest } from "../../domain/models/undo-request.model";

const UNDO_WINDOW_MS = 5000;

export class UndoService {
  private readonly pending = signal<UndoRequest | null>(null);
  private window?: Subscription;

  readonly request: Signal<UndoRequest | null> = this.pending.asReadonly();

  schedule(request: UndoRequest): void {
    this.commitPending();

    this.pending.set(request);
    this.window = timer(UNDO_WINDOW_MS).subscribe(() => this.commitPending());
  }

  undo(): void {
    const request = this.take();
    if (!request) return;

    request.revert();
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

    return request;
  }
}
