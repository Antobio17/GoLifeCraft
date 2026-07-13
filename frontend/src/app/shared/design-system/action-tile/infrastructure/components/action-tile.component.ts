import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-action-tile",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./action-tile.component.html",
  styleUrls: ["./action-tile.component.css"],
})
export class ActionTileComponent {
  @Input() icon?: DsIconName;
  @Input() name = "";
  @Input() meta = "";
  @Input() soon = false;
  @Input() soonLabel = "";

  @Output() clicked = new EventEmitter<void>();
}
