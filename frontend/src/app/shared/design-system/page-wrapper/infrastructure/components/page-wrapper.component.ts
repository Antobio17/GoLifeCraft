import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  afterNextRender,
  inject,
} from "@angular/core";
import { ContentRevealService } from "../../../reveal/application/services/content-reveal.service";

@Component({
  selector: "ds-page-wrapper",
  templateUrl: "./page-wrapper.component.html",
  styleUrls: ["./page-wrapper.component.css"],
  providers: [ContentRevealService],
})
export class PageWrapperComponent {
  @Input() maxWidth = "87.5rem";
  @Input() wideMaxWidth: string | null = null;
  @Input() gap = "var(--ds-space-8)";
  @Input() reveal = true;

  @ViewChild("container", { static: true })
  private container!: ElementRef<HTMLElement>;

  private contentRevealService = inject(ContentRevealService);

  constructor() {
    afterNextRender(() => {
      if (!this.reveal) return;

      this.contentRevealService.observe(this.container.nativeElement);
    });
  }
}
