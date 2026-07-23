import { Provider } from "@angular/core";
import { CreateDiaryEntryPort } from "@nutrition/diary/diary/domain/ports/create-diary-entry.port";
import { UpdateDiaryEntryPort } from "@nutrition/diary/diary/domain/ports/update-diary-entry.port";
import { DeleteDiaryEntryPort } from "@nutrition/diary/diary/domain/ports/delete-diary-entry.port";
import { HttpCreateDiaryEntryAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-create-diary-entry.adapter";
import { HttpUpdateDiaryEntryAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-update-diary-entry.adapter";
import { HttpDeleteDiaryEntryAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-delete-diary-entry.adapter";
import { CreateDiaryEntryService } from "@nutrition/diary/diary/application/services/create-diary-entry.service";
import { UpdateDiaryEntryService } from "@nutrition/diary/diary/application/services/update-diary-entry.service";
import { DeleteDiaryEntryService } from "@nutrition/diary/diary/application/services/delete-diary-entry.service";
import { CreateQuickDiaryEntryPort } from "@nutrition/diary/diary/domain/ports/create-quick-diary-entry.port";
import { UpdateQuickDiaryEntryPort } from "@nutrition/diary/diary/domain/ports/update-quick-diary-entry.port";
import { HttpCreateQuickDiaryEntryAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-create-quick-diary-entry.adapter";
import { HttpUpdateQuickDiaryEntryAdapter } from "@nutrition/diary/diary/infrastructure/adapters/http-update-quick-diary-entry.adapter";
import { CreateQuickDiaryEntryService } from "@nutrition/diary/diary/application/services/create-quick-diary-entry.service";
import { UpdateQuickDiaryEntryService } from "@nutrition/diary/diary/application/services/update-quick-diary-entry.service";
import { QuickDiaryEntryFormService } from "@nutrition/diary/diary/application/services/quick-diary-entry-form.service";
import { DiaryPickerService } from "@nutrition/diary/diary/application/services/diary-picker.service";

export class DiaryWriteProviders {
  static getProviders(): Provider[] {
    return [
      DiaryPickerService,
      QuickDiaryEntryFormService,
      {
        provide: CreateQuickDiaryEntryPort,
        useClass: HttpCreateQuickDiaryEntryAdapter,
      },
      {
        provide: CreateQuickDiaryEntryService,
        useFactory: (port: CreateQuickDiaryEntryPort) =>
          new CreateQuickDiaryEntryService(port),
        deps: [CreateQuickDiaryEntryPort],
      },
      {
        provide: UpdateQuickDiaryEntryPort,
        useClass: HttpUpdateQuickDiaryEntryAdapter,
      },
      {
        provide: UpdateQuickDiaryEntryService,
        useFactory: (port: UpdateQuickDiaryEntryPort) =>
          new UpdateQuickDiaryEntryService(port),
        deps: [UpdateQuickDiaryEntryPort],
      },
      { provide: CreateDiaryEntryPort, useClass: HttpCreateDiaryEntryAdapter },
      {
        provide: CreateDiaryEntryService,
        useFactory: (port: CreateDiaryEntryPort) =>
          new CreateDiaryEntryService(port),
        deps: [CreateDiaryEntryPort],
      },
      { provide: UpdateDiaryEntryPort, useClass: HttpUpdateDiaryEntryAdapter },
      {
        provide: UpdateDiaryEntryService,
        useFactory: (port: UpdateDiaryEntryPort) =>
          new UpdateDiaryEntryService(port),
        deps: [UpdateDiaryEntryPort],
      },
      { provide: DeleteDiaryEntryPort, useClass: HttpDeleteDiaryEntryAdapter },
      {
        provide: DeleteDiaryEntryService,
        useFactory: (port: DeleteDiaryEntryPort) =>
          new DeleteDiaryEntryService(port),
        deps: [DeleteDiaryEntryPort],
      },
    ];
  }
}
