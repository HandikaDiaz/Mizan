import { CreateScrapeJobInput, UpdateScrapeJobInput } from "../lib/type/scrapeJobType";
import { db } from "../prisma/db";

export async function createScrapeJob(
  data: CreateScrapeJobInput,
) {
  return db.orm.public.ScrapeJob.create({
    startDate: data.startDate,
    endDate: data.endDate,
    totalSources: data.totalSources ?? 0,
    status: "PENDING",
  });
}

export async function updateScrapeJob(
  id: string,
  data: UpdateScrapeJobInput,
) {
  return db.orm.public.ScrapeJob
    .where({ id })
    .update(data);
}