import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-progress-bar",
  standalone: true,
  template: `
    <div
      class="ds-pbar"
      role="progressbar"
      [attr.aria-valuenow]="value"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="ds-pbar__fill" [style.width.%]="value"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-pbar {
        height: 6px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        overflow: hidden;
      }
      .ds-pbar__fill {
        height: 100%;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary);
        transition: width var(--ds-transition-base);
      }
    `,
  ],
})
export class ProgressBarComponent {
  @Input() value = 0;
}
