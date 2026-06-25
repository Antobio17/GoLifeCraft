export interface ImageSelectedEvent {
  file: File;
  preview: string;
}

export interface ImageUploadConfig {
  label?: string;
  placeholder?: string;
  hint?: string;
  maxSizeBytes?: number;
  acceptedTypes?: string;
  viewButtonText?: string;
  modalTitle?: string;
  disabled?: boolean;
}

export const DEFAULT_IMAGE_UPLOAD_CONFIG: Required<ImageUploadConfig> = {
  label: "Imagen",
  placeholder: "Subir imagen",
  hint: "PNG/JPG, hasta 100MB",
  maxSizeBytes: 100 * 1024 * 1024,
  acceptedTypes: "image/*",
  viewButtonText: "Ver Imagen",
  modalTitle: "Imagen",
  disabled: false,
};
