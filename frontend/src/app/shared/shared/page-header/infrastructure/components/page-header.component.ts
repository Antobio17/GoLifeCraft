import { Component, Input } from "@angular/core";

export type PageHeaderTone =
  | "sky"
  | "teal"
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "slate";

export interface PageHeaderMeta {
  icon?: string;
  label: string;
}

export interface PageHeaderStat {
  icon?: string;
  label: string;
  value: string | number;
  tone?: PageHeaderTone;
}

@Component({
  selector: "app-page-header",
  templateUrl: "./page-header.component.html",
  styleUrls: ["./page-header.component.css"],
  imports: [],
})
export class PageHeaderComponent {
  @Input() title: string = "";
  @Input() subtitle: string = "";
  @Input() eyebrow: string | null = null;
  @Input() icon: string | null = null;
  @Input() iconTone: PageHeaderTone = "sky";
  @Input() meta: PageHeaderMeta[] = [];
  @Input() stats: PageHeaderStat[] = [];

  subtitleExpanded = false;

  toggleSubtitle(): void {
    this.subtitleExpanded = !this.subtitleExpanded;
  }
}
