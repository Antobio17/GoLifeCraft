import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ChoiceChipOption } from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { PantryLocationKind } from "../../domain/models/pantry-location-kind.model";
import { PantryLocationVisual } from "../../domain/models/pantry-location-visual.model";

interface PantryLocationKindEntry {
  emoji: string;
  aliases: string[];
  glyph: DsGlyph;
  color: string;
}

const KINDS: Record<PantryLocationKind, PantryLocationKindEntry> = {
  [PantryLocationKind.Fridge]: {
    emoji: "🥶",
    aliases: [],
    glyph: DsGlyph.Fridge,
    color: "var(--ds-place-fridge)",
  },
  [PantryLocationKind.Freezer]: {
    emoji: "🧊",
    aliases: ["❄️", "❄"],
    glyph: DsGlyph.Snowflake,
    color: "var(--ds-place-freezer)",
  },
  [PantryLocationKind.Pantry]: {
    emoji: "🚪",
    aliases: [],
    glyph: DsGlyph.Shelves,
    color: "var(--ds-place-pantry)",
  },
  [PantryLocationKind.Cupboard]: {
    emoji: "🗄️",
    aliases: ["🗄"],
    glyph: DsGlyph.Cupboard,
    color: "var(--ds-place-cupboard)",
  },
  [PantryLocationKind.Box]: {
    emoji: "📦",
    aliases: [""],
    glyph: DsGlyph.Box,
    color: "var(--ds-place-box)",
  },
  [PantryLocationKind.Basket]: {
    emoji: "🧺",
    aliases: [],
    glyph: DsGlyph.Basket,
    color: "var(--ds-place-basket)",
  },
  [PantryLocationKind.Jar]: {
    emoji: "🏺",
    aliases: ["🫙"],
    glyph: DsGlyph.Jar,
    color: "var(--ds-place-jar)",
  },
  [PantryLocationKind.Bucket]: {
    emoji: "🪣",
    aliases: [],
    glyph: DsGlyph.Bucket,
    color: "var(--ds-place-bucket)",
  },
  [PantryLocationKind.Kitchen]: {
    emoji: "🍳",
    aliases: [],
    glyph: DsGlyph.Pan,
    color: "var(--ds-place-kitchen)",
  },
  [PantryLocationKind.Home]: {
    emoji: "🏠",
    aliases: ["🏡"],
    glyph: DsGlyph.House,
    color: "var(--ds-place-home)",
  },
  [PantryLocationKind.Car]: {
    emoji: "🚗",
    aliases: [],
    glyph: DsGlyph.Car,
    color: "var(--ds-place-car)",
  },
  [PantryLocationKind.Travel]: {
    emoji: "🧳",
    aliases: [],
    glyph: DsGlyph.Suitcase,
    color: "var(--ds-place-travel)",
  },
  [PantryLocationKind.Storeroom]: {
    emoji: "🏢",
    aliases: [],
    glyph: DsGlyph.Storeroom,
    color: "var(--ds-place-storeroom)",
  },
};

const MODULE_PATH = "nutrition/pantry/location";

@Injectable({ providedIn: "root" })
export class PantryLocationKindCatalogService {
  private translationService = inject(TranslationService);

  kinds(): PantryLocationKind[] {
    return Object.values(PantryLocationKind);
  }

  defaultEmoji(): string {
    return KINDS[PantryLocationKind.Box].emoji;
  }

  visualOf(emoji: string): PantryLocationVisual {
    const { glyph, color } = KINDS[this.kindOf(emoji)];

    return { glyph, color };
  }

  chipOptions(): ChoiceChipOption[] {
    return this.kinds().map((kind) => ({
      value: KINDS[kind].emoji,
      label: this.translationService.translate(
        `pantryLocationKind.${kind}`,
        MODULE_PATH,
      ),
      glyph: KINDS[kind].glyph,
    }));
  }

  canonicalEmoji(emoji: string): string {
    return KINDS[this.kindOf(emoji)].emoji;
  }

  private kindOf(emoji: string): PantryLocationKind {
    const value = emoji.trim();

    return (
      this.kinds().find(
        (kind) =>
          KINDS[kind].emoji === value || KINDS[kind].aliases.includes(value),
      ) ?? PantryLocationKind.Box
    );
  }
}
