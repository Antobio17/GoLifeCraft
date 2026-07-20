import { Component, EventEmitter, Input, Output } from "@angular/core";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";

export interface StoreTab {
  key: string;
  label: string;
  count: number;
}

@Component({
  selector: "ds-store-tabs",
  standalone: true,
  templateUrl: "./store-tabs.component.html",
  styleUrls: ["./store-tabs.component.css"],
  imports: [StackComponent, TextComponent, ChipComponent],
})
export class StoreTabsComponent {
  @Input() tabs: StoreTab[] = [];
  @Input() active = "";

  @Output() selected = new EventEmitter<string>();
}
