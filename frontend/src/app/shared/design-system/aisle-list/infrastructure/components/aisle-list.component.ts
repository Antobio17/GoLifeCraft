import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { TextComponent } from "../../../text/infrastructure/components/text.component";
import { TextInputComponent } from "../../../text-input/infrastructure/components/text-input.component";
import { SwipeToDeleteComponent } from "../../../swipe-to-delete/infrastructure/components/swipe-to-delete.component";
import { AisleListItem } from "../../domain/models/aisle-list-item.model";
import { AisleListMove } from "../../domain/models/aisle-list-move.model";
import { AisleListRename } from "../../domain/models/aisle-list-rename.model";

@Component({
  selector: "ds-aisle-list",
  imports: [
    FormsModule,
    IconComponent,
    StackComponent,
    TextComponent,
    TextInputComponent,
    SwipeToDeleteComponent,
  ],
  templateUrl: "./aisle-list.component.html",
  styleUrls: ["./aisle-list.component.css"],
})
export class AisleListComponent {
  @Input() items: AisleListItem[] = [];
  @Input() emptyText = "";
  @Input() removeLabel = "";
  @Input() editLabel = "";
  @Input() saveLabel = "";
  @Input() cancelLabel = "";
  @Input() namePlaceholder = "";
  @Input() moveUpLabel = "";
  @Input() moveDownLabel = "";
  @Input() disabled = false;

  @Output() moved = new EventEmitter<AisleListMove>();
  @Output() removed = new EventEmitter<string>();
  @Output() renamed = new EventEmitter<AisleListRename>();

  editingId: string | null = null;
  draftName = "";

  onMoveUp(index: number): void {
    if (this.disabled || 0 === index) return;

    this.moved.emit({ from: index, to: index - 1 });
  }

  onMoveDown(index: number): void {
    if (this.disabled || index >= this.items.length - 1) return;

    this.moved.emit({ from: index, to: index + 1 });
  }

  onEdit(item: AisleListItem): void {
    if (this.disabled) return;

    this.editingId = item.id;
    this.draftName = item.name;
  }

  onDraftChange(name: string): void {
    this.draftName = name;
  }

  onCancelEdit(): void {
    this.editingId = null;
    this.draftName = "";
  }

  onConfirmEdit(item: AisleListItem): void {
    const name = this.draftName.trim();

    this.onCancelEdit();

    if ("" === name || name === item.name) return;

    this.renamed.emit({ id: item.id, name });
  }
}
