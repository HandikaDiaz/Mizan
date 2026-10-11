// src/scheduler/scheduler.executor.ts

import { runBnpb } from "./runBnpb"
import { runNews } from "./runNews"
import { runAnalysisDisaster } from "./runAnalysisDisaster"
import { runBmkg } from "./runBmkg"
import { runAyoBantu } from "./runAyoBantu"
import { runAnalysisCampaign } from "./runAnalysisCampaign"

type JobHandler = () => Promise<unknown>

const jobs: Record<string, JobHandler> = {
  NEWS: runNews,
  BMKG: runBmkg,
  BNPB: runBnpb,
  ANALYSIS: runAnalysisDisaster,
  AYOBANTU: runAyoBantu,
  ANALYSISCAMPAIGN: runAnalysisCampaign
}


export async function executeJob(jobType: string) {
  const job = jobs[jobType]

  if (!job) {
    throw new Error(
      `Job type "${jobType}" tidak ditemukan`
    )
  }

  await job()
}