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
import { DiaryPickerService } from "@nutrition/diary/diary/application/services/diary-picker.service";

export class DiaryWriteProviders {
  static getProviders(): Provider[] {
    return [
      DiaryPickerService,
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
