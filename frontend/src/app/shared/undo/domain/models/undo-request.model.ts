export interface UndoRequest {
  id: string;
  keyTranslation: string;
  details: Record<string, unknown>;
  commit: () => void;
}
