// src/scheduler/scheduler.manager.ts

import cron, { ScheduledTask } from "node-cron"
import { executeJob } from "./job/jobRegistry"
import { CronExpressionParser } from "cron-parser"
import { db } from "../prisma/db"

type SchedulerTask = ScheduledTask

class SchedulerManager {
  private tasks = new Map<string, SchedulerTask>()
  private running = new Set<string>()

  async startAll() {
    const schedulers = await db.orm.public.Scheduler.where({
      isActive: true,
    }).all()

    console.log(`[scheduler] Loading ${schedulers.length} active scheduler`)

    for (const scheduler of schedulers) {
      await this.start(scheduler.id)
    }

    console.log("[scheduler] All scheduler started")
  }

  async start(id: string) {
    const scheduler = await db.orm.public.Scheduler.where({ id }).first()

    if (!scheduler) {
      throw new Error(`Scheduler "${id}" tidak ditemukan`)
    }

    if (!scheduler.isActive) {
      console.log(`[scheduler] ${scheduler.name} inactive, skip`)

      return
    }

    if (!cron.validate(scheduler.cron)) {
      throw new Error(
        `Cron tidak valid untuk ${scheduler.name}: ${scheduler.cron}`
      )
    }

    this.stop(id)

    const task = cron.schedule(scheduler.cron, async () => {
      await this.execute(scheduler.id)
    })

    this.tasks.set(id, task)

    await this.updateNextRun(scheduler.id)

    console.log(`[scheduler] Started: ${scheduler.name} (${scheduler.cron})`)
  }

  stop(id: string) {
    const task = this.tasks.get(id)

    if (!task) {
      return
    }

    task.stop()

    this.tasks.delete(id)

    console.log(`[scheduler] Stopped: ${id}`)
  }

  async restart(id: string) {
    this.stop(id)

    await this.start(id)
  }

  async execute(id: string) {
    if (this.running.has(id)) {
      console.log(`[scheduler] ${id} masih running, skip`)

      return
    }

    this.running.add(id)

    let shouldUpdateFinishedAt = false

    try {
      const scheduler = await db.orm.public.Scheduler.where({ id }).first()

      if (!scheduler) {
        console.warn(`[scheduler] ${id} tidak ditemukan`)

        this.stop(id)

        return
      }

      if (!scheduler.isActive) {
        console.log(`[scheduler] ${scheduler.name} inactive, skip`)

        this.stop(id)

        return
      }

      // Job mulai
      await db.orm.public.Scheduler.where({ id }).update({
        lastRunAt: new Date().toISOString(),
      })

      shouldUpdateFinishedAt = true

      console.log(`[scheduler] Running: ${scheduler.name}`)

      await executeJob(scheduler.jobType)

      console.log(`[scheduler] Completed: ${scheduler.name}`)
    } catch (error) {
      console.error(`[scheduler] Job ${id} failed`, error)
    } finally {
      if (shouldUpdateFinishedAt) {
        try {
          await db.orm.public.Scheduler.where({ id }).update({
            lastFinishedAt: new Date().toISOString(),
          })

          await this.updateNextRun(id)
        } catch (error) {
          console.error(
            `[scheduler] Failed updating scheduler metadata:`,
            error
          )
        }
      }

      this.running.delete(id)
    }
  }

  async updateNextRun(id: string) {
    const scheduler = await db.orm.public.Scheduler.where({ id }).first()

    if (!scheduler) {
      return
    }

    const interval = CronExpressionParser.parse(scheduler.cron)

    const nextRun = interval.next().toDate()

    await db.orm.public.Scheduler.where({ id }).update({
      nextRunAt: nextRun.toISOString(),
    })
  }

  stopAll() {
    for (const [id, task] of this.tasks) {
      task.stop()

      console.log(`[scheduler] Stopped: ${id}`)
    }

    this.tasks.clear()
  }

  isRunning(id: string) {
    return this.tasks.has(id)
  }
}

export const schedulerManager = new SchedulerManager()