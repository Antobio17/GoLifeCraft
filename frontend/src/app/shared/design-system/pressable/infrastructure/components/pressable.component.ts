import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-pressable",
  standalone: true,
  template: `
    <button
      type="button"
      class="ds-pressable__button"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel || null"
      (click)="press.emit()"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      :host([grow]) {
        flex: 1 1 auto;
      }
      .ds-pressable__button {
        display: flex;
        align-items: center;
        gap: var(--ds-pressable-gap, 11px);
        width: 100%;
        min-width: 0;
        appearance: none;
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        font: inherit;
        text-align: left;
        color: inherit;
        cursor: pointer;
      }
      .ds-pressable__button:disabled {
        cursor: default;
      }
    `,
  ],
  host: {
    "[attr.grow]": "grow ? '' : null",
    "[style.--ds-pressable-gap]": "gap",
  },
})
export class PressableComponent {
  @Input() ariaLabel = "";
  @Input() disabled = false;
  @Input() grow = false;
  @Input() gap = "11px";

  @Output() press = new EventEmitter<void>();
}
