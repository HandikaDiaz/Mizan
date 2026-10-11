import { describe, expect, it } from "vitest"

import { getStoragePathFromReference } from "./storage-reference"

describe("getStoragePathFromReference", () => {
  it("extracts a path from an expired Supabase signed URL", () => {
    expect(
      getStoragePathFromReference(
        "https://example.supabase.co/storage/v1/object/sign/milestone-proofs/12/3/4/proof%20file.jpg?token=expired",
        "milestone-proofs",
      ),
    ).toBe("12/3/4/proof file.jpg")
  })

  it("keeps a plain storage path unchanged", () => {
    expect(getStoragePathFromReference("12/3/4/proof.pdf", "milestone-proofs")).toBe(
      "12/3/4/proof.pdf",
    )
  })
})
