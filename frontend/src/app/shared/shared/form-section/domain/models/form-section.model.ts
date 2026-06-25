export interface FormSectionIcon {
  width: number;
  height: number;
  viewBox: string;
  paths: string[];
}

export interface FormSectionConfig {
  title: string;
  icon?: FormSectionIcon;
  iconName?: string;
  collapsible?: boolean;
  collapsed?: boolean;
}
