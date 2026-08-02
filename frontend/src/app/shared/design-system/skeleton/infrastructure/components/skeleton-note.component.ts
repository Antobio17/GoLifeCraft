import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-note",
  template: `
    <div class="sknote">
      <span class="ds-sk sknote__icon"></span>
      <div class="sknote__text">
        @for (line of lineArray; track line) {
          <span class="ds-sk sknote__line"></span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sknote {
        --ds-skeleton-base: color-mix(
          in srgb,
          var(--ds-primary) 14%,
          transparent
        );
        --ds-skeleton-highlight: color-mix(
          in srgb,
          var(--ds-primary) 26%,
          transparent
        );
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        gap: 9px;
        background: var(--ds-primary-soft);
        border-radius: 13px;
        padding: 12px 13px;
      }
      .sknote__icon {
        flex: 0 0 auto;
        width: 16px;
        height: 16px;
        border-radius: var(--ds-radius-sm);
      }
      .sknote__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sknote__line {
        width: 100%;
        height: 9px;
      }
      .sknote__text .sknote__line:last-child {
        width: 62%;
      }
    `,
  ],
})
export class SkeletonNoteComponent {
  @Input() lines = 2;

  get lineArray(): number[] {
    return Array.from({ length: this.lines }, (_, index) => index);
  }
}
