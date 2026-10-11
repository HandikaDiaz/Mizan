// scheduler.service.ts

import cron from "node-cron"

import { schedulerManager } from "../scheduler/schedulerManager"
import { db } from "../prisma/db"
import {
  CreateSchedulerInput,
  UpdateSchedulerInput,
} from "../lib/type/schedulerType"
import { buildCron } from "../lib/buildCorn"

export async function createScheduler(data: CreateSchedulerInput) {
  const cronExpression = buildCron(data.schedule)
  if (!cron.validate(cronExpression)) {
    throw new Error(`Cron expression tidak valid: ${cronExpression}`)
  }

  const scheduler = await db.orm.public.Scheduler.create({
    name: data.name,
    jobType: data.jobType,
    cron: cronExpression,
    isActive: data.isActive ?? true,
  })

  if (scheduler.isActive) {
    await schedulerManager.start(scheduler.id)
  }

  return scheduler
}

export async function updateScheduler(id: string, data: UpdateSchedulerInput) {
  const existingScheduler = await db.orm.public.Scheduler.first()

  if (!existingScheduler) {
    throw new Error(`Scheduler dengan id "${id}" tidak ditemukan`)
  }

  const updateData: {
    name?: string
    jobType?: string
    cron?: string
    isActive?: boolean
  } = {}

  if (data.name !== undefined) {
    updateData.name = data.name
  }

  if (data.jobType !== undefined) {
    updateData.jobType = data.jobType
  }

  if (data.schedule !== undefined) {
    const cronExpression = buildCron(data.schedule)
    if (!cron.validate(cronExpression)) {
      throw new Error(`Cron expression tidak valid: ${cronExpression}`)
    }

    updateData.cron = cronExpression
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive
  }

  await db.orm.public.Scheduler.where({ id }).update(updateData)

  const scheduler = await db.orm.public.Scheduler.where({ id }).first()

  if (!scheduler) {
    throw new Error(
      `Scheduler dengan id "${id}" tidak ditemukan setelah update`
    )
  }

  if (!scheduler.isActive) {
    schedulerManager.stop(id)
  } else {
    await schedulerManager.restart(id)
  }

  return scheduler
}

export async function deleteScheduler(id: string) {
  schedulerManager.stop(id)

  await db.orm.public.Scheduler.where({ id }).delete()
}

export async function getAllSchedulers() {
  return await db.orm.public.Scheduler.all()
}
