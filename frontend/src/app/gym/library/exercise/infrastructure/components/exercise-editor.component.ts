import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
} from "@angular/forms";
import { delay, tap } from "rxjs/operators";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { MusclePickerComponent } from "@shared/design-system/muscle-picker/infrastructure/components/muscle-picker.component";
import { SegmentedToggleComponent } from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { CreateExerciseService } from "../../application/services/create-exercise.service";
import { UpdateExerciseService } from "../../application/services/update-exercise.service";
import { GetExerciseService } from "../../application/services/get-exercise.service";
import { GetExerciseResponse } from "../../domain/models/get-exercise-response.model";
import {
  EXERCISE_TYPES,
  MUSCLE_GROUPS_BY_REGION,
} from "../../domain/constants/muscle-groups.constants";

@Component({
  selector: "app-exercise-editor",
  templateUrl: "./exercise-editor.component.html",
  styleUrls: ["./gym-form.css"],
  imports: [
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    FieldComponent,
    MusclePickerComponent,
    SegmentedToggleComponent,
  ],
})
export class ExerciseEditorComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createExerciseService = inject(CreateExerciseService);
  private updateExerciseService = inject(UpdateExerciseService);
  private getExerciseService = inject(GetExerciseService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "gym/library/exercise";
  readonly muscleGroups = MUSCLE_GROUPS_BY_REGION;
  readonly typeOptions = [
    { value: EXERCISE_TYPES.BILATERAL, label: "Bilateral" },
    { value: EXERCISE_TYPES.UNILATERAL, label: "Unilateral" },
  ];

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  private id = "";

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      type: [EXERCISE_TYPES.BILATERAL, [Validators.required]],
      muscleGroups: [[] as string[], [this.atLeastOneMuscle]],
    });
  }

  get isEdit(): boolean {
    return !!this.id;
  }

  get title(): string {
    return this.t(
      this.isEdit ? "updateExercise.title" : "createExercise.title",
    );
  }

  get saveLabel(): string {
    return this.t(this.isEdit ? "updateExercise.save" : "createExercise.save");
  }

  get modeHint(): string {
    return this.t(
      this.form.value.type === EXERCISE_TYPES.UNILATERAL
        ? "createExercise.mode.unilateralHint"
        : "createExercise.mode.bilateralHint",
    );
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

        this.getExerciseService.getExercise(this.id).subscribe({
          next: (response: GetExerciseResponse) => {
            this.form.patchValue({
              name: response.data.attributes.name,
              type: response.data.attributes.type,
              muscleGroups: response.data.attributes.muscleGroups ?? [],
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

  private atLeastOneMuscle(control: AbstractControl): ValidationErrors | null {
    return Array.isArray(control.value) && control.value.length > 0
      ? null
      : { required: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.get("muscleGroups")?.invalid) {
        this.floatingToastService.showToast({
          status: 400,
          keyTranslation: "exercise.validation.muscleGroups",
          details: [],
        });
      }
      return;
    }

    this.saving.set(true);

    const payload = {
      name: this.form.value.name ?? "",
      type: this.form.value.type ?? EXERCISE_TYPES.BILATERAL,
      muscleGroups: this.form.value.muscleGroups ?? [],
    };

    const request$ = this.isEdit
      ? this.updateExerciseService.updateExercise(this.id, payload)
      : this.createExerciseService.createExercise(payload);

    request$
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.floatingToastService.showToast({
            status: 200,
            keyTranslation: this.isEdit
              ? "exercise.update.success"
              : "exercise.create.success",
            details: [],
          });
        }),
        delay(900),
      )
      .subscribe({
        next: () => this.router.navigate(["/gym/exercises"]),
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(["/gym/exercises"]);
  }
}
