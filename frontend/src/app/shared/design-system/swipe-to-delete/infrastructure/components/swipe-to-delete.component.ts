import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-swipe-to-delete",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./swipe-to-delete.component.html",
  styleUrls: ["./swipe-to-delete.component.css"],
})
export class SwipeToDeleteComponent {
  private readonly START_THRESHOLD = 8;

  @Input() disabled = false;
  @Input() reveal = 66;
  @Input() radius = 14;
  @Input() removeLabel = "";

  @Output() remove = new EventEmitter<void>();

  offset = 0;
  private dragging = false;
  private swiping = false;
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private baseX = 0;

  get slid(): boolean {
    return this.offset < 0;
  }

  get transform(): string {
    return this.offset === 0 ? "none" : `translateX(${this.offset}px)`;
  }

  get transition(): string {
    return this.dragging ? "none" : "transform 0.2s ease";
  }

  onPointerDown(event: PointerEvent): void {
    if (this.disabled || event.button !== 0) return;

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
    this.offset = Math.min(0, Math.max(-this.reveal, this.baseX + deltaX));
  }

  onPointerUp(): void {
    if (this.swiping) {
      this.offset = this.offset < -this.reveal / 2 ? -this.reveal : 0;
    }

    this.reset();
  }

  onDelete(): void {
    this.offset = 0;
    this.reset();
    this.remove.emit();
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
