/**
 * Menyalin ABI dari artifact Hardhat ke src/lib/chain/abi sebagai file ber-versi.
 *
 * Alasannya: aplikasi Next.js tidak boleh mengimpor artifact Hardhat langsung.
 * ABI diperlakukan sebagai interface ber-versi, sehingga perubahan interface
 * terlihat sebagai file baru (v2) dan bukan menimpa yang sedang dipakai.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { isDeepStrictEqual } from "node:util"
import { fileURLToPath } from "node:url"

const CONTRACT_NAME = "MizanFundingVault"

const here = path.dirname(fileURLToPath(import.meta.url))
const contractsRoot = path.resolve(here, "..")

const artifactPath = path.join(
  contractsRoot,
  "artifacts",
  "src",
  `${CONTRACT_NAME}.sol`,
  `${CONTRACT_NAME}.json`,
)

const version = process.env["MIZAN_CONTRACT_VERSION"] ?? "v1"
if (!/^v[1-9][0-9]*$/.test(version) || /\s/.test(version)) throw new Error("Versi ABI harus v1, v2, ...")
const outDir = path.resolve(contractsRoot, "..", "src", "lib", "chain", "abi")
const outPath = path.join(outDir, `${CONTRACT_NAME}.${version}.json`)

let artifact: { abi?: unknown[] }
try {
  artifact = JSON.parse(await readFile(artifactPath, "utf8"))
} catch {
  console.error(
    `Artifact tidak ditemukan di ${artifactPath}\n` +
      `Jalankan "npm run compile" lebih dulu.`,
  )
  process.exit(1)
}

if (!Array.isArray(artifact.abi)) {
  console.error(`Artifact di ${artifactPath} tidak memuat array abi.`)
  process.exit(1)
}

await mkdir(outDir, { recursive: true })
try {
  await writeFile(outPath, `${JSON.stringify(artifact.abi, null, 2)}\n`, { encoding: "utf8", flag: "wx" })
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
  const existing: unknown = JSON.parse(await readFile(outPath, "utf8"))
  // ABI entry ordering is irrelevant; parameter order inside entries remains significant.
  const entries = (abi: unknown[]) => abi.map((entry) => canonical(entry)).sort()
  if (!Array.isArray(existing) || !isDeepStrictEqual(entries(existing), entries(artifact.abi))) {
    throw new Error(`ABI ${version} sudah ada dan berbeda. Naikkan MIZAN_CONTRACT_VERSION; file lama tidak diubah.`)
  }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`
  }
  return JSON.stringify(value)
}

const entryCount = artifact.abi.length
console.log(
  `ABI ${CONTRACT_NAME} (${version}) ditulis ke ${path.relative(
    path.resolve(contractsRoot, ".."),
    outPath,
  )} — ${entryCount} entri`,
)
