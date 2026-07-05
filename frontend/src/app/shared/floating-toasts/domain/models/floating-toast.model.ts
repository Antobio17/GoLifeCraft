export type FloatingToastType = "success" | "info" | "warning" | "error";

export interface FloatingToastMessage {
  status: number;
  type?: FloatingToastType;
  title?: string;
  keyTranslation: string;
  subtitleTranslation?: string;
  details: Record<string, unknown> | unknown[];
}
