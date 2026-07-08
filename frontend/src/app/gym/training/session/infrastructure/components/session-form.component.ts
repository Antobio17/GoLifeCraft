import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { delay, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { ChoiceChipsComponent } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { CreateSessionService } from "../../application/services/create-session.service";
import { UpdateSessionService } from "../../application/services/update-session.service";
import { GetSessionService } from "../../application/services/get-session.service";
import { GetSessionResponse } from "../../domain/models/get-session-response.model";
import {
  CreateSessionRequest,
  SessionExerciseRequest,
} from "../../domain/models/session-request.model";
import { SessionExerciseView } from "../../domain/models/session-detail.model";

@Component({
  selector: "app-session-form",
  templateUrl: "./session-form.component.html",
  styleUrls: ["./gym-form.css"],
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    FieldComponent,
    ChoiceChipsComponent,
  ],
})
export class SessionFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createSessionService = inject(CreateSessionService);
  private updateSessionService = inject(UpdateSessionService);
  private getSessionService = inject(GetSessionService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "gym/training/session";
  readonly estOptions = [
    { value: 45, label: "45 min" },
    { value: 55, label: "55 min" },
    { value: 75, label: "75 min" },
  ];

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  private id = "";
  private existingExercises: SessionExerciseRequest[] = [];

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      estimatedDurationMinutes: [55, [Validators.required]],
    });
  }

  get isEdit(): boolean {
    return !!this.id;
  }

  get title(): string {
    return this.t(this.isEdit ? "updateSession.title" : "createSession.title");
  }

  get saveLabel(): string {
    return this.t(this.isEdit ? "updateSession.save" : "createSession.save");
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id") ?? "";

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        if (!this.isEdit) {
          this.loading.set(false);
          return;
        }

        this.getSessionService.getSession(this.id).subscribe({
          next: (response: GetSessionResponse) => {
            const attributes = response.data.attributes;
            this.existingExercises = attributes.exercises.map((exercise) =>
              this.toRequest(exercise),
            );
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

  private toRequest(exercise: SessionExerciseView): SessionExerciseRequest {
    return {
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroups: exercise.muscleGroups,
      type: exercise.type,
      position: exercise.position,
      sets: exercise.sets.map((set) => ({
        position: set.position,
        reps: set.reps,
        weight: set.weight,
      })),
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload: CreateSessionRequest = {
      name: this.form.value.name ?? "",
      estimatedDurationMinutes: this.form.value.estimatedDurationMinutes ?? 0,
      exercises: this.existingExercises,
    };

    const request$ = this.isEdit
      ? this.updateSessionService.updateSession(this.id, payload)
      : this.createSessionService.createSession(payload);

    request$
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: this.isEdit
              ? "session.update.success"
              : "session.create.success",
            details: [],
          });
        }),
        delay(900),
      )
      .subscribe({
        next: () => this.navigateAway(),
        error: () => this.saving.set(false),
      });
  }

  private navigateAway(): void {
    if (this.isEdit) {
      this.router.navigate(["/gym/sessions", this.id]);
      return;
    }
    this.router.navigate(["/gym/sessions"]);
  }

  cancel(): void {
    this.navigateAway();
  }
}
