import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-emoji-tile",
  standalone: true,
  template: `<span class="ds-emoji-tile">{{ emoji }}</span>`,
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
        width: var(--tile-size, 40px);
        height: var(--tile-size, 40px);
        border-radius: var(--tile-radius, 11px);
        background: var(--ds-surface-inset);
        font-size: var(--tile-font, 20px);
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

  get fontSize(): number {
    return Math.round(this.size * 0.5);
  }
}
