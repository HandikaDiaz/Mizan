export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { schedulerManager } = await import("./src/scheduler/schedulerManager")
    schedulerManager.startAll()
  }
}