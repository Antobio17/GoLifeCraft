import { Signal, computed, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { AbstractControl } from "@angular/forms";

export class EditorDraft {
  private readonly saved = signal<string | null>(null);
  private readonly current: Signal<string>;
  private pendingLeave: (() => void) | null = null;

  readonly hasChanges: Signal<boolean>;
  readonly confirmingDiscard = signal(false);

  constructor(snapshot: () => unknown) {
    this.current = computed(() => JSON.stringify(snapshot()));
    this.hasChanges = computed(() => {
      const saved = this.saved();

      return null !== saved && saved !== this.current();
    });
  }

  static forForm(
    form: AbstractControl,
    extra: () => unknown = () => null,
  ): EditorDraft {
    const value = toSignal(form.valueChanges, { initialValue: form.value });

    return new EditorDraft(() => ({ value: value(), extra: extra() }));
  }

  markSaved(): void {
    this.saved.set(this.current());
  }

  leave(navigate: () => void): void {
    if (!this.hasChanges()) {
      navigate();
      return;
    }

    this.pendingLeave = navigate;
    this.confirmingDiscard.set(true);
  }

  discard(): void {
    const navigate = this.pendingLeave;

    this.keepEditing();
    navigate?.();
  }

  keepEditing(): void {
    this.pendingLeave = null;
    this.confirmingDiscard.set(false);
  }
}
