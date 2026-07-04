import { Pipe, PipeTransform, inject } from "@angular/core";
import { TranslationService } from "../../application/services/translation.service";

@Pipe({
  name: "t",
  pure: false,
})
export class ContextualTranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  private readonly CONTEXT_MAP: { [key: string]: string } = {
    login: "authorization/login/login",
    register: "authorization/register/register",
    landing: "landing/landing/landing",
    getUsers: "authorization/user/user",
    user: "authorization/user/user",
    profile: "authorization/user/user",
    updateUser: "authorization/user/user",
    createUser: "authorization/user/user",
    dashboard: "dashboard/dashboard",
    formSelect: "shared/shared/form-select",
    imageUploader: "shared/shared/image-uploader",
    formInput: "shared/shared/form-input",
    formDate: "shared/shared/form-date",
    formCheckboxGrid: "shared/shared/form-checkbox-grid",
    formTextarea: "shared/shared/form-textarea",
    floatingSaveButton: "shared/shared/floating-save-button",
    pagination: "shared/shared/pagination",
    listFilters: "shared/shared/list-filters",
    navbar: "layouts/layout/navbar/navbar",
    cloud: "cloud/folder/folder",
    folder: "cloud/folder/folder",
    file: "cloud/folder/folder",
    role: "authorization/user/user",
    creating: "authorization/user/user",
    cannot: "authorization/user/user",
    access: "authorization/user/user",
    new: "authorization/user/user",
    the: "shared/shared/argument-errors",
    error: "shared/shared/argument-errors",
    handler: "shared/shared/argument-errors",
    token: "shared/shared/argument-errors",
    listTable: "shared/shared/list-table",
    breadcrumbs: "shared/shared/breadcrumbs",
    floatingToast: "shared/shared/floating-toasts",
    domainEventLog: "shared/shared/domain-event-log",
    eventNames: "shared/shared/domain-event-log",
    payloadProperties: "shared/shared/domain-event-log",
  };

  transform(key: string, params?: Record<string, unknown>): string {
    if (!key) {
      return key;
    }

    const contextPrefix = key.split(".")[0];
    const modulePath = this.CONTEXT_MAP[contextPrefix];

    if (!modulePath) {
      return key;
    }

    if (!this.translationService.isModuleLoaded(modulePath)) {
      this.translationService.loadModuleTranslations(modulePath);
    }

    return this.translationService.translate(key, modulePath, params);
  }
}
