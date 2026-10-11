import { db } from "@/src/prisma/db"
import {
  ACTIVE_DISBURSEMENT_STATUSES,
  type DisbursementRequestStatus,
} from "./disbursement-workflow"

export async function hasActiveRequest(milestoneId: number): Promise<boolean> {
  const requests = await db.orm.public.DisbursementRequest.where({ milestoneId }).all()
  return requests.some((request) =>
    (ACTIVE_DISBURSEMENT_STATUSES as readonly string[]).includes(
      request.status as DisbursementRequestStatus,
    ),
  )
}
