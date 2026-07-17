import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BrandLogoComponent } from "../../../brand-logo/infrastructure/components/brand-logo.component";
import { AuthTab } from "../../domain/models/auth-tab.model";

@Component({
  selector: "ds-auth-card",
  standalone: true,
  imports: [BrandLogoComponent],
  templateUrl: "./auth-card.component.html",
  styleUrls: ["./auth-card.component.css"],
})
export class AuthCardComponent {
  @Input() tabs: AuthTab[] = [];
  @Input() activeTab = "";
  @Input() tagline: string | null = null;

  get hasTabs(): boolean {
    return this.tabs.length > 0;
  }

  @Output() tabSelected = new EventEmitter<string>();

  select(key: string): void {
    if (key === this.activeTab) return;
    this.tabSelected.emit(key);
  }
}
