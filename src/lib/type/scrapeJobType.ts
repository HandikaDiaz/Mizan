
export interface CreateScrapeJobInput {
  startDate: string;
  endDate: string;
  totalSources?: number;
}

export interface UpdateScrapeJobInput {
  status?: ScrapeJobStatus;
  totalSources?: number;
  processedData?: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export type ScrapeJobStatus = "PENDING" | "PLANNING" | "SCRAPING" | "ANALYZING" | "COMPLETED" | "FAILED";