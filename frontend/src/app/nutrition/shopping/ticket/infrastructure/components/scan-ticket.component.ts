import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { PhotoCaptureComponent } from "@shared/design-system/photo-capture/infrastructure/components/photo-capture.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { SpinnerComponent } from "@shared/design-system/spinner/infrastructure/components/spinner.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { PriceInputComponent } from "@shared/design-system/price-input/infrastructure/components/price-input.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { GetSupermarketsService } from "@nutrition/catalog/supermarket/application/services/get-supermarkets.service";
import { uuidV4 } from "@shared/uuid/uuid";
import { GetTicketDraftService } from "../../application/services/get-ticket-draft.service";
import { CreateTicketService } from "../../application/services/create-ticket.service";
import { TicketDraftViewService } from "../../application/services/ticket-draft-view.service";
import { TicketDraft } from "../../domain/models/ticket-draft.model";
import { TicketDraftLine } from "../../domain/models/ticket-draft-line.model";

@Component({
  selector: "app-scan-ticket",
  templateUrl: "./scan-ticket.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    PhotoCaptureComponent,
    ButtonComponent,
    CardComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    NoteComponent,
    SpinnerComponent,
    FieldComponent,
    TextInputComponent,
    PriceInputComponent,
    DateInputComponent,
    SelectComponent,
    IconButtonComponent,
    SkeletonListComponent,
  ],
})
export class ScanTicketComponent implements OnInit {
  private translationService = inject(TranslationService);
  private getTicketDraftService = inject(GetTicketDraftService);
  private createTicketService = inject(CreateTicketService);
  private getSupermarketsService = inject(GetSupermarketsService);
  private ticketDraftView = inject(TicketDraftViewService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly MODULE_PATH = "nutrition/shopping/ticket";

  readonly maxPhotos = 4;
  readonly photoMaxSide = 1800;

  photos = signal<File[]>([]);
  analyzing = signal(false);
  saving = signal(false);
  reviewing = signal(false);
  lines = signal<TicketDraftLine[]>([]);
  lowConfidenceFields = signal<string[]>([]);
  supermarketOptions = signal<SelectOption[]>([]);

  storeName = signal("");
  supermarketId = signal("");
  purchasedOn = signal("");
  total = signal<number | null>(null);

  readonly title = computed(() => this.t("scanTicket.title"));
  readonly hasPhotos = computed(() => this.photos().length > 0);
  readonly rows = computed(() => this.ticketDraftView.rowsOf(this.lines()));

  readonly linesTotalLabel = computed(() =>
    this.ticketDraftView.money(this.ticketDraftView.linesTotal(this.lines())),
  );

  readonly difference = computed(() =>
    this.ticketDraftView.difference(this.total(), this.lines()),
  );

  readonly differenceLabel = computed(() => {
    const difference = this.difference();

    if (null === difference) return "";

    return this.t("scanTicket.review.difference", {
      amount: this.ticketDraftView.money(Math.abs(difference)),
    });
  });

  readonly lowConfidenceLabel = computed(() => {
    const fields = this.lowConfidenceFields();

    if (0 === fields.length) return "";

    return this.t("scanTicket.review.lowConfidence", {
      fields: fields
        .map((field) => this.t(`scanTicket.field.${field}`))
        .join(", "),
    });
  });

  readonly canSave = computed(
    () =>
      "" !== this.storeName().trim() &&
      "" !== this.purchasedOn() &&
      this.lines().length > 0,
  );

  ngOnInit(): void {
    this.translationService.loadModuleTranslations(this.MODULE_PATH);
    this.loadSupermarkets();
  }

  onPhotosChange(photos: File[]): void {
    this.photos.set(photos);
  }

  onAnalyze(): void {
    if (!this.hasPhotos() || this.analyzing()) {
      return;
    }

    this.analyzing.set(true);

    this.getTicketDraftService.getTicketDraft(this.photos()).subscribe({
      next: (response) => {
        this.analyzing.set(false);
        this.onDraft(response.data.draft, response.data.lowConfidenceFields);
      },
      error: () => this.analyzing.set(false),
    });
  }

  onRemoveLine(index: number): void {
    this.lines.update((lines) => this.ticketDraftView.without(lines, index));
  }

  onSave(): void {
    if (!this.canSave() || this.saving()) {
      return;
    }

    const id = uuidV4();
    this.saving.set(true);

    this.createTicketService
      .createTicket({
        id,
        storeName: this.storeName().trim(),
        supermarketId: this.supermarketId() || null,
        purchasedOn: this.purchasedOn(),
        total: this.total(),
        note: "",
        lines: this.lines(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(["/tickets", id]);
        },
        error: () => this.saving.set(false),
      });
  }

  onRetake(): void {
    this.reviewing.set(false);
    this.lines.set([]);
    this.lowConfidenceFields.set([]);
  }

  cancel(): void {
    this.router.navigate(["/tickets"]);
  }

  private onDraft(
    draft: TicketDraft | null,
    lowConfidenceFields: string[],
  ): void {
    if (null === draft) {
      this.floatingToastService.showToast({
        status: 422,
        keyTranslation: "ticket.draft.not.recognized",
        details: [],
      });

      return;
    }

    this.storeName.set(draft.storeName ?? "");
    this.supermarketId.set(draft.supermarketId ?? "");
    this.purchasedOn.set(draft.purchasedOn ?? this.ticketDraftView.todayIso());
    this.total.set(draft.total);
    this.lines.set(draft.lines);
    this.lowConfidenceFields.set(lowConfidenceFields);
    this.reviewing.set(true);
  }

  private loadSupermarkets(): void {
    this.getSupermarketsService.getSupermarkets(1, 100).subscribe({
      next: (response) =>
        this.supermarketOptions.set(
          response.data.map((supermarket) => ({
            value: supermarket.id,
            label: supermarket.attributes.name,
          })),
        ),
    });
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.MODULE_PATH, params);
  }
}
