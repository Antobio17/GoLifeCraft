import { Component, OnInit, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { ChoiceChipsComponent } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { CreateSessionService } from "../../application/services/create-session.service";
import { UpdateSessionDetailsService } from "../../application/services/update-session-details.service";
import { GetSessionService } from "../../application/services/get-session.service";
import { SessionDraftService } from "../../application/services/session-draft.service";
import { GetSessionResponse } from "../../domain/models/get-session-response.model";

@Component({
  selector: "app-session-form",
  templateUrl: "./session-form.component.html",
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    FieldComponent,
    ChoiceChipsComponent,
    StackComponent,
    TextInputComponent,
    ButtonComponent,
  ],
})
export class SessionFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createSessionService = inject(CreateSessionService);
  private updateSessionDetailsService = inject(UpdateSessionDetailsService);
  private getSessionService = inject(GetSessionService);
  private sessionDraft = inject(SessionDraftService);
  private router = inject(Router);

  private readonly MODULE_PATH = "gym/training/session";
  readonly estOptions = [
    { value: 45, label: "45 min" },
    { value: 55, label: "55 min" },
    { value: 75, label: "75 min" },
  ];

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  readonly id = input<string>("");

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      estimatedDurationMinutes: [55, [Validators.required]],
    });
  }

  get isEdit(): boolean {
    return !!this.id();
  }

  get title(): string {
    return this.t(this.isEdit ? "updateSession.title" : "createSession.title");
  }

  get saveLabel(): string {
    return this.t(this.isEdit ? "updateSession.save" : "createSession.save");
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        if (!this.isEdit) {
          this.loading.set(false);
          return;
        }

        this.getSessionService.getSession(this.id()).subscribe({
          next: (response: GetSessionResponse) => {
            const attributes = response.data.attributes;
            this.form.patchValue({
              name: attributes.name,
              estimatedDurationMinutes: attributes.estimatedDurationMinutes,
            });
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      });
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const name = this.form.value.name ?? "";
    const estimatedDurationMinutes =
      this.form.value.estimatedDurationMinutes ?? 0;

    const request$ = this.isEdit
      ? this.updateSessionDetailsService.updateSessionDetails(this.id(), {
          name,
          estimatedDurationMinutes,
        })
      : this.createSessionService.createSession(
          this.sessionDraft.toRequest(name, estimatedDurationMinutes, []),
        );

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.navigateAway();
      },
      error: () => this.saving.set(false),
    });
  }

  private navigateAway(): void {
    if (this.isEdit) {
      this.router.navigate(["/gym/sessions", this.id()]);
      return;
    }
    this.router.navigate(["/gym/sessions"]);
  }

  cancel(): void {
    this.navigateAway();
  }
}
