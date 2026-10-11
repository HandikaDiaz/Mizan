import { describe, expect, it } from "vitest"

import { translateText } from "./language-provider"

describe("language translations", () => {
  it("translates public disbursement history labels to English", () => {
    expect(translateText("Histori penggunaan dana", "en")).toBe(
      "Fund usage history"
    )
    expect(
      translateText("Belum ada penyaluran yang dipublikasikan", "en")
    ).toBe("No published disbursements yet")
    expect(translateText("Lihat bukti", "en")).toBe("View proof")
  })

  it("keeps Indonesian copy unchanged in Indonesian mode", () => {
    expect(translateText("Histori penggunaan dana", "id")).toBe(
      "Histori penggunaan dana"
    )
  })

  it("translates shared dashboard actions and falls back for unknown copy", () => {
    expect(translateText("Profil", "en")).toBe("Profile")
    expect(translateText("Simpan perubahan", "en")).toBe("Save changes")
    expect(translateText("Unknown dashboard copy", "en")).toBe(
      "Unknown dashboard copy"
    )
  })
})
