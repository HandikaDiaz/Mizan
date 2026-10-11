export type DataFormat =
  | "JSON"
  | "RSS"
  | "HTML"
  | "OTHERS";

export type SourceCategory =
  | "OFFICIAL"
  | "NEWS"
  | "SOCIAL_MEDIA";

export interface CreateSourceInput {
  name: string;
  baseUrlOrHandle: string;
  dataFormats: DataFormat;
  sourceType: SourceCategory;
  isOfficial: boolean;
  isActive: boolean;
}

export type UpdateSourceInput = Partial<CreateSourceInput>;