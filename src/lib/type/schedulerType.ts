export type SchedulerCorn =
  | {
      type: "INTERVAL"
      interval: number
      intervalUnit: "MINUTE" | "HOUR"
    }
  | {
      type: "DAILY"
      time: string
    }
  | {
      type: "WEEKLY"
      dayOfWeek: number
      time: string
    }
  | {
      type: "MONTHLY"
      dayOfMonth: number
      time: string
    }

export interface CreateSchedulerInput {
  name: string
  jobType: string
  schedule: SchedulerCorn
  isActive?: boolean
}

export interface UpdateSchedulerInput {
  name?: string
  isActive?: boolean
  schedule?: SchedulerCorn
  jobType?: string
}
