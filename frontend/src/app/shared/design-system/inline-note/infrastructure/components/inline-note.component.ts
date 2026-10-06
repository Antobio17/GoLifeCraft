import {
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  output,
} from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { TextareaComponent } from "@shared/design-system/textarea/infrastructure/components/textarea.component";

@Component({
  selector: "ds-inline-note",
  imports: [IconComponent, TextareaComponent],
  template: `
    @if (editing()) {
      <ds-textarea
        [value]="value()"
        [placeholder]="placeholder()"
        [ariaLabel]="ariaLabel()"
        [rows]="2"
        [compact]="true"
        (valueChange)="valueChange.emit($event)"
        (focusout)="editingChange.emit(false)"
      />
    } @else if (value()) {
      <button
        type="button"
        class="ds-inote"
        [attr.aria-label]="editLabel() + ': ' + value()"
        (click)="editingChange.emit(true)"
      >
        <ds-icon
          class="ds-inote__icon"
          name="pencil"
          [size]="14"
          [stroke]="2"
        />
        <span class="ds-inote__text">{{ value() }}</span>
      </button>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      :host:empty {
        display: none;
      }
      .ds-inote {
        appearance: none;
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: var(--ds-space-1-5);
        padding: var(--ds-space-1);
        border: none;
        border-radius: var(--ds-radius-mark);
        background: transparent;
        color: var(--ds-text-muted);
        font-family: var(--ds-font-body);
        text-align: left;
        cursor: text;
        -webkit-tap-highlight-color: transparent;
        transition: background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-inote:hover {
        background: var(--ds-surface-inset);
      }
      .ds-inote:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-inote__icon {
        flex: 0 0 auto;
        margin-top: 2px;
        opacity: 0.8;
      }
      .ds-inote__text {
        min-width: 0;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-medium);
        line-height: var(--ds-leading-snug);
        white-space: pre-line;
        overflow-wrap: anywhere;
      }
    `,
  ],
})
export class InlineNoteComponent {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  value = input("");
  editing = input(false);
  placeholder = input("");
  ariaLabel = input("");
  editLabel = input("");

  valueChange = output<string>();
  editingChange = output<boolean>();

  constructor() {
    afterRenderEffect(() => {
      if (!this.editing()) {
        return;
      }

      const field = this.host.nativeElement.querySelector("textarea");
      if (!field) {
        return;
      }

      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
    });
  }
}
