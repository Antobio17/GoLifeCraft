export interface UndoRequest {
  label: string;
  commit: () => void;
  revert: () => void;
}
