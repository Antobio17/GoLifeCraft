export interface FloatingSaveButtonConfig {
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "small" | "medium" | "large";
  icon?: FloatingSaveButtonIcon;
  fullWidth?: boolean;
}

export interface FloatingSaveButtonIcon {
  show?: boolean;
  customIcon?: string;
}

export const DEFAULT_FLOATING_SAVE_BUTTON_CONFIG: Required<FloatingSaveButtonConfig> =
  {
    label: "Guardar",
    loadingLabel: "Guardando...",
    disabled: false,
    loading: false,
    type: "button",
    variant: "primary",
    size: "medium",
    icon: { show: true },
    fullWidth: false,
  };
