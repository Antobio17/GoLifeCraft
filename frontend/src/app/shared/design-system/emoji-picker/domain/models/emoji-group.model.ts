export interface EmojiOption {
  emoji: string;
  label: string;
  keywords?: string[];
}

export interface EmojiGroup {
  label: string;
  items: EmojiOption[];
}
