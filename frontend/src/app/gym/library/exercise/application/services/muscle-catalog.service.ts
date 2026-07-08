import { Injectable } from "@angular/core";
import { MuscleRegion } from "@shared/design-system/muscle-picker/infrastructure/components/muscle-picker.component";

@Injectable({ providedIn: "root" })
export class MuscleCatalogService {
  private readonly regionsData: MuscleRegion[] = [
    {
      region: "Tren superior",
      items: [
        "Pecho",
        "Espalda",
        "Hombro",
        "Bíceps",
        "Tríceps",
        "Antebrazo",
        "Trapecio",
      ],
    },
    {
      region: "Core",
      items: ["Abdominales", "Core", "Lumbar"],
    },
    {
      region: "Tren inferior",
      items: ["Cuádriceps", "Femoral", "Glúteo", "Aductor", "Gemelo"],
    },
  ];

  regions(): MuscleRegion[] {
    return this.regionsData;
  }

  regionNames(): string[] {
    return this.regionsData.map((region) => region.region);
  }

  all(): string[] {
    return this.regionsData.flatMap((region) => region.items);
  }

  regionOf(muscle: string): string | undefined {
    return this.regionsData.find((region) => region.items.includes(muscle))
      ?.region;
  }
}
