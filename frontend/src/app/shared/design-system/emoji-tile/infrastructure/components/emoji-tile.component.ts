import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-emoji-tile",
  template: `
    @if (imageUrl && !imageFailed) {
      <img
        class="ds-emoji-tile ds-emoji-tile--image"
        [src]="imageUrl"
        [alt]="alt"
        loading="lazy"
        decoding="async"
        (error)="imageFailed = true"
      />
    } @else {
      <span class="ds-emoji-tile">{{ emoji }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: 0 0 auto;
      }
      .ds-emoji-tile {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--tile-size, 2.5rem);
        height: var(--tile-size, 2.5rem);
        border-radius: var(--tile-radius, var(--ds-radius-lg));
        background: var(--ds-surface-inset);
        font-size: var(--tile-font, var(--ds-text-xl));
      }
      .ds-emoji-tile--image {
        display: block;
        object-fit: cover;
        overflow: hidden;
      }
    `,
  ],
  host: {
    "[style.--tile-size.px]": "size",
    "[style.--tile-radius.px]": "radius",
    "[style.--tile-font.px]": "fontSize",
  },
})
export class EmojiTileComponent {
  @Input() emoji = "";
  @Input() size = 40;
  @Input() radius = 11;
  @Input() alt = "";

  @Input()
  set imageUrl(value: string | null) {
    if (value === this.currentImageUrl) return;

    this.currentImageUrl = value;
    this.imageFailed = false;
  }

  get imageUrl(): string | null {
    return this.currentImageUrl;
  }

  private currentImageUrl: string | null = null;
  imageFailed = false;

  get fontSize(): number {
    return Math.round(this.size * 0.5);
  }
}
