import { Component, OnInit, computed, input, signal } from "@angular/core";
import {
  FormSectionConfig,
  FormSectionIcon,
} from "../../domain/models/form-section.model";

@Component({
  selector: "ds-form-section",
  templateUrl: "./form-section.component.html",
  styleUrls: ["./form-section.component.css"],
})
export class FormSectionComponent implements OnInit {
  readonly config = input<FormSectionConfig | undefined>(undefined);
  readonly title = input<string | undefined>(undefined);
  readonly icon = input<FormSectionIcon | undefined>(undefined);
  readonly iconName = input<string | undefined>(undefined);
  readonly collapsible = input<boolean | undefined>(undefined);
  readonly collapsed = input<boolean | undefined>(undefined);

  readonly isCollapsed = signal(false);

  readonly sectionConfig = computed<FormSectionConfig>(() => ({
    title: this.title() || this.config()?.title || "",
    icon: this.icon() || this.config()?.icon,
    iconName: this.iconName() || this.config()?.iconName,
    collapsible: this.collapsible() ?? this.config()?.collapsible ?? false,
    collapsed: this.collapsed() ?? this.config()?.collapsed ?? false,
  }));

  ngOnInit(): void {
    this.isCollapsed.set(this.sectionConfig().collapsed ?? false);
  }

  toggleCollapse(): void {
    if (!this.sectionConfig().collapsible) {
      return;
    }

    this.isCollapsed.update((value) => !value);
  }
}
