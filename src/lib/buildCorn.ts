import { SchedulerCorn } from "./type/schedulerType"


export function buildCron(schedule: SchedulerCorn) {
  switch (schedule.type) {
    case "INTERVAL": {
      if (schedule.interval <= 0) {
        throw new Error(
          "Interval harus lebih dari 0"
        )
      }

      if (schedule.intervalUnit === "MINUTE") {
        return `*/${schedule.interval} * * * *`
      }

      if (schedule.intervalUnit === "HOUR") {
        return `0 */${schedule.interval} * * *`
      }

      throw new Error(
        "Interval unit tidak valid"
      )
    }

    case "DAILY": {
      const [hour, minute] =
        schedule.time.split(":")

      return `${minute} ${hour} * * *`
    }

    case "WEEKLY": {
      const [hour, minute] =
        schedule.time.split(":")

      return `${minute} ${hour} * * ${schedule.dayOfWeek}`
    }

    case "MONTHLY": {
      const [hour, minute] =
        schedule.time.split(":")

      return `${minute} ${hour} ${schedule.dayOfMonth} * *`
    }

    default:
      throw new Error(
        "Schedule type tidak didukung"
      )
  }
}