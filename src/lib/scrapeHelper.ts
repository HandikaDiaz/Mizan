import { updateScrapeJob } from "../service/scrapeServices";

export async function startScrapeJob(id: string) {
  return updateScrapeJob(id, {
    status: "SCRAPING",
    startedAt: new Date().toISOString(),
  });
}



export async function startAnalysisScrapeJob(id: string) {
  return updateScrapeJob(id, {
    status: "ANALYZING",
  });
}

export async function completeScrapeJob(id: string) {
  return updateScrapeJob(id, {
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
  });
}

export async function failScrapeJob(
  id: string,
  error: unknown,
) {
  return updateScrapeJob(id, {
    status: "FAILED",
    completedAt: new Date().toISOString(),
    errorMessage:
      error instanceof Error
        ? error.message
        : String(error),
  });
}