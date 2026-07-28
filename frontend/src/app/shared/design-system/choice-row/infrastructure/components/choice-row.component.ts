import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-choice-row",
  standalone: true,
  template: `
    <button type="button" class="ds-choicerow" (click)="activated.emit()">
      <span class="ds-choicerow__emoji">{{ emoji }}</span>
      <span class="ds-choicerow__text">
        <span class="ds-choicerow__title">{{ title }}</span>
        <span class="ds-choicerow__description">{{ description }}</span>
      </span>
      <svg
        class="ds-choicerow__chevron"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-choicerow {
        display: flex;
        align-items: center;
        gap: 13px;
        width: 100%;
        text-align: left;
        appearance: none;
        cursor: pointer;
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border);
        border-radius: 16px;
        padding: 14px;
        font: inherit;
        color: inherit;
        transition: border-color var(--ds-transition-fast);
      }
      .ds-choicerow:hover {
        border-color: var(--ds-border-strong);
      }
      .ds-choicerow__emoji {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        border-radius: 13px;
        background: var(--ds-primary-soft);
        font-size: 24px;
      }
      .ds-choicerow__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-choicerow__title {
        font-family: var(--ds-font-display);
        font-size: 14.5px;
        font-weight: 800;
      }
      .ds-choicerow__description {
        font-size: 11.5px;
        line-height: 1.4;
        color: var(--ds-text-muted);
      }
      .ds-choicerow__chevron {
        flex: 0 0 auto;
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class ChoiceRowComponent {
  @Input() emoji = "";
  @Input() title = "";
  @Input() description = "";

  @Output() activated = new EventEmitter<void>();
}
