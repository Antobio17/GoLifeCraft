import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";

@Component({
  selector: "app-list-item-card",
  templateUrl: "./list-item-card.component.html",
  styleUrls: ["./list-item-card.component.css"],
  imports: [ButtonComponent],
})
export class ListItemCardComponent {
  @Input() title: string = "";
  @Input() isReadOnly: boolean = false;
  @Input() isDeleting: boolean = false;
  @Input() canRemove: boolean = true;
  @Output() delete = new EventEmitter<void>();
}
