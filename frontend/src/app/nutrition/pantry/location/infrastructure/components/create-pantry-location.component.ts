import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ChoiceChipsComponent } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { SkeletonFieldsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-fields.component";
import { CreatePantryLocationService } from "@nutrition/pantry/location/application/services/create-pantry-location.service";
import { PantryLocationKindCatalogService } from "@nutrition/pantry/location/application/services/pantry-location-kind-catalog.service";
import { DiscardChangesModalComponent } from "@shared/design-system/discard-changes-modal/infrastructure/components/discard-changes-modal.component";
import { EditorDraft } from "@shared/editor-form/application/editor-draft";
import { EditorFormDirective } from "@shared/editor-form/infrastructure/directives/editor-form.directive";

@Component({
  selector: "app-create-pantry-location",
  templateUrl: "./create-pantry-location.component.html",
  imports: [
    DiscardChangesModalComponent,
    EditorFormDirective,
    ReactiveFormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    FieldComponent,
    StackComponent,
    TextInputComponent,
    ButtonComponent,
    ChoiceChipsComponent,
    SkeletonFieldsComponent,
  ],
})
export class CreatePantryLocationComponent implements OnInit {
  private translationService = inject(TranslationService);
  private formBuilder = inject(FormBuilder);
  private createPantryLocationService = inject(CreatePantryLocationService);
  private kindCatalog = inject(PantryLocationKindCatalogService);
  private backNavigation = inject(BackNavigationService);

  private readonly MODULE_PATH = "nutrition/pantry/location";
  readonly kindOptions = computed(() => this.kindCatalog.chipOptions());

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  protected readonly draft: EditorDraft;
  private readonly editorForm = viewChild(EditorFormDirective);

  constructor() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(60)]],
      emoji: [this.kindCatalog.defaultEmoji()],
      description: ["", [Validators.maxLength(255)]],
    });
    this.draft = EditorDraft.forForm(this.form);
    this.draft.markSaved();
  }

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loading.set(false);
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.createPantryLocationService
      .createPantryLocation({
        name: this.form.value.name ?? "",
        emoji: this.form.value.emoji ?? "",
        description: this.form.value.description ?? "",
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.draft.markSaved();
          this.backNavigation.leave(["/locations"]);
        },
        error: () => this.saving.set(false),
      });
  }

  save(): void {
    this.editorForm()?.submit();
  }

  cancel(): void {
    this.draft.leave(() => this.backNavigation.leave(["/locations"]));
  }
}
