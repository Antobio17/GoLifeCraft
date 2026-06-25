export interface FloatingToastMessage {
  status: number;
  title?: string;
  keyTranslation: string;
  details: Record<string, unknown> | unknown[];
}
