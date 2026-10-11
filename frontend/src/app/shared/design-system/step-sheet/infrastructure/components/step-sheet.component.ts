import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ModalSheetComponent } from "../../../modal-sheet/infrastructure/components/modal-sheet.component";
import { FieldComponent } from "../../../field/infrastructure/components/field.component";
import { TextareaComponent } from "../../../textarea/infrastructure/components/textarea.component";
import { NumberInputComponent } from "../../../number-input/infrastructure/components/number-input.component";
import { ButtonComponent } from "../../../button/infrastructure/components/button.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { StepDraft } from "../../domain/models/step-draft.model";

@Component({
  selector: "ds-step-sheet",
  imports: [
    FormsModule,
    ModalSheetComponent,
    FieldComponent,
    TextareaComponent,
    NumberInputComponent,
    ButtonComponent,
    StackComponent,
  ],
  templateUrl: "./step-sheet.component.html",
})
export class StepSheetComponent {
  private textarea = viewChild(TextareaComponent, {
    read: ElementRef<HTMLElement>,
  });

  open = input(false);
  title = input("");
  text = input("");
  minutes = input<number | null>(null);
  autofocus = input(false);
  closeLabel = input("");
  confirmLabel = input("");
  textLabel = input("");
  placeholder = input("");
  minutesLabel = input("");
  minutesUnit = input("min");
  decrementLabel = input("");
  incrementLabel = input("");
  addAnotherLabel = input("");
  removeLabel = input("");

  closed = output<void>();
  saved = output<StepDraft>();
  savedAndNext = output<StepDraft>();
  removed = output<void>();

  private focusRequest = signal(0);

  private seed = computed(() => ({
    open: this.open(),
    text: this.text(),
    minutes: this.minutes(),
  }));

  draftText = linkedSignal({
    source: this.seed,
    computation: (seed) => seed.text,
  });

  draftMinutes = linkedSignal({
    source: this.seed,
    computation: (seed) => seed.minutes ?? 0,
  });

  valid = computed(() => this.draftText().trim().length > 0);

  changed = computed(
    () =>
      this.draftText().trim() !== this.text().trim() ||
      this.normalizedMinutes() !== this.minutes(),
  );

  constructor() {
    afterRenderEffect(() => {
      this.focusRequest();

      if (!this.open() || !this.autofocus()) {
        return;
      }

      const field = this.textarea()?.nativeElement.querySelector("textarea");
      if (!field) {
        return;
      }

      field.focus({ preventScroll: true });
      field.setSelectionRange(field.value.length, field.value.length);
    });
  }

  save(): void {
    if (!this.valid()) {
      return;
    }

    this.saved.emit(this.draft());
  }

  saveAndNext(): void {
    if (!this.valid()) {
      return;
    }

    this.savedAndNext.emit(this.draft());
    this.draftText.set("");
    this.draftMinutes.set(0);
    this.focusRequest.update((request) => request + 1);
  }

  private draft(): StepDraft {
    return {
      text: this.draftText().trim(),
      minutes: this.normalizedMinutes(),
    };
  }

  private normalizedMinutes(): number | null {
    const minutes = Number(this.draftMinutes()) || 0;

    return minutes > 0 ? minutes : null;
  }
}
