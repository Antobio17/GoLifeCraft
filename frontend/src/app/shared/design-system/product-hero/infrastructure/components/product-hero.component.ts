import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-product-hero",
  standalone: true,
  template: `
    <div class="ds-product-hero">
      <span class="ds-product-hero__emoji">{{ emoji }}</span>
      @if (price) {
        <span class="ds-product-hero__price">{{ price }}</span>
      } @else if (badge) {
        <span class="ds-product-hero__price">{{ badge }}</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-product-hero {
        position: relative;
        height: 118px;
        border-radius: 20px;
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 52px;
      }
      .ds-product-hero__price {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        border-radius: 9px;
        padding: 5px 10px;
        font-family: var(--ds-font-display);
        font-weight: 700;
        font-size: 14px;
      }
    `,
  ],
})
export class ProductHeroComponent {
  @Input() emoji = "";
  @Input() price: string | null = null;
  @Input() badge: string | null = null;
}
