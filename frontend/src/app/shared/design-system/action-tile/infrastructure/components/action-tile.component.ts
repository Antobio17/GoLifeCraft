import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-action-tile",
  standalone: true,
  templateUrl: "./action-tile.component.html",
  styleUrls: ["./action-tile.component.css"],
})
export class ActionTileComponent {
  @Input() name = "";
  @Input() meta = "";
  @Input() primary = false;

  @Output() clicked = new EventEmitter<void>();
}
