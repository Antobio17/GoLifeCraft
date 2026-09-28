import { PreferenceChoiceOption } from "@shared/design-system/preference-choice/domain/models/preference-choice-option.model";

export interface NotificationPreferenceRow {
  type: string;
  icon: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  time: string | null;
  leadMinutes: string | null;
  leadOptions: PreferenceChoiceOption[];
  testId: string;
}
