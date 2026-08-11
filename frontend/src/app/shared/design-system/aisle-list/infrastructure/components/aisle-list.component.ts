import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { AisleListItem } from "../../domain/models/aisle-list-item.model";
import { AisleListMove } from "../../domain/models/aisle-list-move.model";

@Component({
  selector: "ds-aisle-list",
  imports: [IconComponent, StackComponent, TextComponent],
  templateUrl: "./aisle-list.component.html",
  styleUrls: ["./aisle-list.component.css"],
})
export class AisleListComponent {
  @Input() items: AisleListItem[] = [];
  @Input() emptyText = "";
  @Input() removeLabel = "";
  @Input() moveUpLabel = "";
  @Input() moveDownLabel = "";
  @Input() disabled = false;

  @Output() moved = new EventEmitter<AisleListMove>();
  @Output() removed = new EventEmitter<string>();

  draggingIndex = signal<number | null>(null);

  onDragStart(index: number): void {
    if (this.disabled) return;

    this.draggingIndex.set(index);
  }

  onDragOver(event: DragEvent, index: number): void {
    if (this.disabled) return;

    event.preventDefault();

    const from = this.draggingIndex();
    if (null === from || from === index) return;

    this.draggingIndex.set(index);
    this.moved.emit({ from, to: index });
  }

  onDragEnd(): void {
    this.draggingIndex.set(null);
  }

  onMoveUp(index: number): void {
    if (this.disabled || 0 === index) return;

    this.moved.emit({ from: index, to: index - 1 });
  }

  onMoveDown(index: number): void {
    if (this.disabled || index >= this.items.length - 1) return;

    this.moved.emit({ from: index, to: index + 1 });
  }
}
