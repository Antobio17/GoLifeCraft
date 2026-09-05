import { Injectable } from "@angular/core";
import { EmojiGroup } from "@shared/design-system/emoji-picker/domain/models/emoji-group.model";

@Injectable({ providedIn: "root" })
export class PantryLocationEmojiCatalogService {
  groups(): EmojiGroup[] {
    return [
      {
        label: "Frío",
        items: [
          { emoji: "🧊", label: "Congelador", keywords: ["frio", "hielo"] },
          { emoji: "🥶", label: "Nevera", keywords: ["frio", "frigorifico"] },
          { emoji: "❄️", label: "Congelado", keywords: ["frio"] },
        ],
      },
      {
        label: "Almacenaje",
        items: [
          { emoji: "🗄️", label: "Armario", keywords: ["mueble"] },
          { emoji: "🚪", label: "Despensa", keywords: ["puerta"] },
          { emoji: "📦", label: "Caja", keywords: ["cajon"] },
          { emoji: "🧺", label: "Cesta", keywords: ["cesto"] },
          { emoji: "🏺", label: "Bote", keywords: ["tarro"] },
          { emoji: "🪣", label: "Cubo", keywords: ["balde"] },
        ],
      },
      {
        label: "Zonas",
        items: [
          { emoji: "🍳", label: "Cocina", keywords: ["sarten"] },
          { emoji: "🏠", label: "Casa", keywords: ["hogar"] },
          { emoji: "🚗", label: "Coche", keywords: ["maletero"] },
          { emoji: "🧳", label: "Maleta", keywords: ["viaje"] },
          { emoji: "🏢", label: "Trastero", keywords: ["almacen"] },
        ],
      },
    ];
  }
}
