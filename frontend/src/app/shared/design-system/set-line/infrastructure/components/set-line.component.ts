import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-set-line",
  imports: [IconComponent],
  template: `
    <div
      class="ds-sline"
      [class.ds-sline--done]="done"
      [class.ds-sline--skipped]="!done"
      [class.ds-sline--warmup]="warmup"
    >
      <span class="ds-sline__num">{{ displayLabel }}</span>
      <span class="ds-sline__value">{{ reps }}</span>
      <span class="ds-sline__value">{{ weight ?? 0 }}</span>
      <span
        class="ds-sline__check"
        [attr.role]="checkLabel ? 'img' : null"
        [attr.aria-label]="checkLabel || null"
        [attr.aria-hidden]="checkLabel ? null : 'true'"
      >
        @if (done) {
          <ds-icon name="check" [size]="16" [stroke]="3" />
        }
      </span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-sline {
        display: flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        padding: var(--ds-space-1);
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface);
      }
      .ds-sline--done {
        background: var(--ds-primary-soft);
      }
      .ds-sline__num {
        width: 2rem;
        height: 2rem;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface-inset);
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-base);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
      }
      .ds-sline--warmup .ds-sline__num {
        background: var(--ds-warning-soft);
        color: var(--ds-warning);
      }
      .ds-sline--done .ds-sline__num {
        background: transparent;
        color: var(--ds-primary-soft-text);
      }
      .ds-sline__value {
        flex: 1 1 0;
        min-width: 0;
        height: 2.375rem;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border-hairline);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
      }
      .ds-sline--skipped .ds-sline__value {
        color: var(--ds-text-meta);
        text-decoration: line-through;
        text-decoration-thickness: 1.5px;
      }
      .ds-sline__check {
        flex: 0 0 auto;
        width: 2.25rem;
        height: 2.25rem;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 2px dashed var(--ds-border-strong);
        color: var(--ds-on-primary);
      }
      .ds-sline--done .ds-sline__check {
        background: var(--ds-primary);
        border: 2px solid var(--ds-primary);
      }
    `,
  ],
})
export class SetLineComponent {
  @Input() displayLabel = "";
  @Input() reps = 0;
  @Input() weight: number | null = null;
  @Input() done = false;
  @Input() warmup = false;
  @Input() doneLabel = "";
  @Input() skippedLabel = "";

  protected get checkLabel(): string {
    return this.done ? this.doneLabel : this.skippedLabel;
  }
}
