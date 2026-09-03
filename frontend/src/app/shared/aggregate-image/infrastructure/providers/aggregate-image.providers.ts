import { Provider } from "@angular/core";
import { ImageResizerService } from "@shared/design-system/photo-capture/application/services/image-resizer.service";
import { AggregateImagePort } from "@shared/aggregate-image/domain/ports/aggregate-image.port";
import { HttpAggregateImageAdapter } from "@shared/aggregate-image/infrastructure/adapters/http-aggregate-image.adapter";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";

export class AggregateImageProviders {
  static getProviders(): Provider[] {
    return [
      { provide: AggregateImagePort, useClass: HttpAggregateImageAdapter },
      {
        provide: AggregateImageService,
        useFactory: (
          port: AggregateImagePort,
          imageResizerService: ImageResizerService,
        ) => new AggregateImageService(port, imageResizerService),
        deps: [AggregateImagePort, ImageResizerService],
      },
    ];
  }
}
