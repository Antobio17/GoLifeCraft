import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";

export interface NotificationPreferenceRow {
  type: string;
  glyph: DsGlyph;
  title: string;
  subtitle: string;
  enabled: boolean;
  time: string | null;
  timeLabel: string;
  leadMinutes: string | null;
  leadOptions: SelectOption[];
  testId: string;
}
