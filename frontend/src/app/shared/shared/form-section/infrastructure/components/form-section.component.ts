import { Component, Input, OnInit } from "@angular/core";
import {
  FormSectionConfig,
  FormSectionIcon,
} from "../../domain/models/form-section.model";

@Component({
  selector: "app-form-section",
  templateUrl: "./form-section.component.html",
  styleUrls: ["./form-section.component.css"],
})
export class FormSectionComponent implements OnInit {
  @Input() config?: FormSectionConfig;
  @Input() title?: string;
  @Input() icon?: FormSectionIcon;
  @Input() iconName?: string;
  @Input() collapsible?: boolean;
  @Input() collapsed?: boolean;

  isCollapsed: boolean = false;

  get sectionConfig(): FormSectionConfig {
    return {
      title: this.title || this.config?.title || "",
      icon: this.icon || this.config?.icon,
      iconName: this.iconName || this.config?.iconName,
      collapsible: this.collapsible ?? this.config?.collapsible ?? false,
      collapsed: this.collapsed ?? this.config?.collapsed ?? false,
    };
  }

  ngOnInit(): void {
    this.isCollapsed = this.sectionConfig.collapsed ?? false;
  }

  toggleCollapse(): void {
    if (this.sectionConfig.collapsible) {
      this.isCollapsed = !this.isCollapsed;
    }
  }
}
