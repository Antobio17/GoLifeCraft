import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";

type ChipTone = "neutral" | "brand" | "accent" | "warning";

@Component({
  selector: "ds-diary-entry",
  standalone: true,
  imports: [IconComponent, EmojiTileComponent, ChipComponent],
  templateUrl: "./diary-entry.component.html",
  styleUrls: ["./diary-entry.component.css"],
})
export class DiaryEntryComponent {
  private readonly REVEAL = 66;
  private readonly START_THRESHOLD = 8;
  private readonly OPEN_THRESHOLD = 33;

  @Input() emoji = "";
  @Input() name = "";
  @Input() badge = "";
  @Input() badgeTone: ChipTone = "neutral";
  @Input() kcalLabel = "";
  @Input() unit = "";
  @Input() quantity = 0;
  @Input() quantityLabel = "";
  @Input() canWrite = false;
  @Input() quantityAriaLabel = "";
  @Input() removeLabel = "";

  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();

  offset = 0;
  private dragging = false;
  private swiping = false;
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private baseX = 0;

  get transform(): string {
    return `translateX(${this.offset}px)`;
  }

  get transition(): string {
    return this.dragging ? "none" : "transform 0.2s ease";
  }

  get slid(): boolean {
    return this.offset < 0;
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.canWrite || event.button !== 0) return;

    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.baseX = this.offset;
    this.swiping = false;
  }

  onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    if (!this.swiping && !this.tryStartSwipe(event, deltaX, deltaY)) return;

    event.preventDefault();
    this.offset = Math.min(0, Math.max(-this.REVEAL, this.baseX + deltaX));
  }

  onPointerUp(): void {
    if (this.swiping) {
      this.offset = this.offset < -this.OPEN_THRESHOLD ? -this.REVEAL : 0;
    }

    this.reset();
  }

  onDelete(): void {
    this.offset = 0;
    this.reset();
    this.remove.emit();
  }

  onQtyInput(event: Event): void {
    const parsed = Number.parseFloat(
      (event.target as HTMLInputElement).value.replace(",", "."),
    );
    if (!Number.isFinite(parsed)) return;

    this.quantityChange.emit(parsed);
  }

  private tryStartSwipe(
    event: PointerEvent,
    deltaX: number,
    deltaY: number,
  ): boolean {
    if (
      Math.abs(deltaX) > this.START_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      this.swiping = true;
      this.dragging = true;
      (event.currentTarget as Element).setPointerCapture(event.pointerId);
      return true;
    }

    if (Math.abs(deltaY) > this.START_THRESHOLD) {
      this.reset();
    }

    return false;
  }

  private reset(): void {
    this.dragging = false;
    this.swiping = false;
    this.pointerId = null;
  }
}
