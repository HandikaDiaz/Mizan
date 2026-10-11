
export type DisasterCandidateType = {
    id: string;
    name: string;
    description: string;
    disasterType : DisasterType;
    locationName: string;
    province: string;
    capitalCity: string;
    eventDate: string;
    sourceUrl: string;
    sourceName: string;
    sourceType: "OFFICIAL" | "NEWS" | "SOCIAL_MEDIA";
}

export type DisasterType = "GEMPA_BUMI" | "BANJIR" | "TANAH_LONGSOR" | "KARHUTLA" | "TSUNAMI" | "ERUPSI_GUNUNG_API" | "ANGIN_PUTING_BELIUNG" | "KEKERINGAN" | "LAINNYA";



export interface RelatedDisasterEvent {
  id: string
  title: string
  disasterType: string | null
  locationName: string | null
  province: string | null
  city: string | null
  severityLevel: string | null
  validationStatus: string
}