import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-add-item-button",
  templateUrl: "./add-item-button.component.html",
  styleUrls: ["./add-item-button.component.css"],
  imports: [],
})
export class AddItemButtonComponent {
  @Input() label: string = "";
  @Input() disabled: boolean = false;
  @Input() isReadOnly: boolean = false;
  @Input() hint: string = "";
  @Output() add = new EventEmitter<void>();
}
