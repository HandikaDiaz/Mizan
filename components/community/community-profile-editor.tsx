"use client"

import { useState } from "react"
import type { ComponentProps } from "react"
import { CommunityProfileModal } from "./community-profile-modal"

type CommunityProfile = ComponentProps<typeof CommunityProfileModal>["community"]

export function CommunityProfileEditor({ community }: { community: CommunityProfile }) {
  const [open, setOpen] = useState(false)
  return <>{open ? <CommunityProfileModal community={community} onClose={() => { setOpen(false); window.location.reload() }} /> : <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white">Edit profil organisasi</button>}</>
}
