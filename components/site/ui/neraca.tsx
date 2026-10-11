import type { CSSProperties } from "react"

import { cn } from "@/src/lib/utils"
import { formatAngka } from "@/src/lib/site-data"

/**
 * NERACA MIZAN — visual khas halaman.
 *
 * Satu-satunya gerakan bermakna di halaman ini. Lengan bergerak sekali ke
 * posisi sebenarnya lalu berhenti; panci ikut naik/turun tapi tetap mendatar
 * (dibalik putarannya), seperti neraca sungguhan.
 *
 * Sudutnya PROPORSIONAL terhadap selisih dana, bukan angka hiasan:
 *   tilt = (masuk - keluar) / masuk * 30°
 * Artinya kalau seluruh dana tersalur, neraca benar-benar mendatar.
 */

const TILT_FULL_SCALE_DEG = 30
const TILT_LIMIT_DEG = 9

function hitungTilt(masuk: number, keluar: number) {
  if (masuk <= 0) return 0
  const selisih = (masuk - keluar) / masuk
  const deg = selisih * TILT_FULL_SCALE_DEG
  return Math.max(-TILT_LIMIT_DEG, Math.min(TILT_LIMIT_DEG, deg))
}

type NeracaProps = {
  masuk: number
  keluar: number
  satuan: string
  className?: string
}

export function Neraca({ masuk, keluar, satuan, className }: NeracaProps) {
  const tilt = hitungTilt(masuk, keluar)
  const selisih = Math.round((masuk - keluar) * 100) / 100

  return (
    <figure className={cn("w-full", className)}>
      <div
        className="relative mx-auto h-[340px] w-full max-w-[560px] sm:h-[400px]"
        style={{ "--mz-tilt": `${tilt}deg` } as CSSProperties}
      >
        {/* ── Ornamen: tiang, poros, dasar ─────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[92px] bottom-[52px] w-px -translate-x-1/2 bg-line-soft"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[80px] size-[11px] -translate-x-1/2 rotate-45 rounded-[2px] bg-brand-700"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[46px] left-1/2 h-[3px] w-[38%] max-w-[180px] -translate-x-1/2 rounded-full bg-ink"
        />

        {/* ── Balok ────────────────────────────────────────────────────── */}
        <div className="mz-beam absolute inset-x-[15%] top-[86px] h-[3px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-ink"
          />

          {/* Panci kiri — dana masuk (lebih berat saat belum tersalur) */}
          <div className="mz-pan absolute left-0 top-0 -ml-12 flex w-24 flex-col items-center sm:-ml-14 sm:w-28">
            <div
              aria-hidden="true"
              className="h-[68px] w-px bg-line-soft sm:h-20"
            />
            <div
              aria-hidden="true"
              className="h-[5px] w-full rounded-full bg-brand-700"
            />
            <p className="mt-4 mz-num text-center text-xs text-ink-muted">
              Dana masuk
            </p>
            <p className="mz-num text-base font-semibold text-ink sm:text-lg">
              {formatAngka(masuk)}
              <span className="text-xs font-normal text-ink-muted">
                {" "}
                {satuan}
              </span>
            </p>
          </div>

          {/* Panci kanan — dana tersalur */}
          <div className="mz-pan absolute right-0 top-0 -mr-12 flex w-24 flex-col items-center sm:-mr-14 sm:w-28">
            <div
              aria-hidden="true"
              className="h-[68px] w-px bg-line-soft sm:h-20"
            />
            <div
              aria-hidden="true"
              className="h-[5px] w-full rounded-full bg-brand-700"
            />
            <p className="mt-4 mz-num text-center text-xs text-ink-muted">
              Sudah disalurkan
            </p>
            <p className="mz-num text-base font-semibold text-ink sm:text-lg">
              {formatAngka(keluar)}
              <span className="text-xs font-normal text-ink-muted">
                {" "}
                {satuan}
              </span>
            </p>
          </div>
        </div>

        {/* ── Keterangan selisih di bawah tiang ────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <p className="mz-num rounded-md border border-accent-200 bg-accent-200/40 px-3 py-1.5 text-center text-xs text-ink">
            Selisih {formatAngka(selisih)} {satuan} masih ditahan kontrak —
            menunggu bukti penyaluran
          </p>
        </div>
      </div>

      <figcaption className="sr-only">
        Neraca dana: {formatAngka(masuk)} {satuan} masuk, sudah disalurkan{" "}
        {formatAngka(keluar)} {satuan}. Selisih {formatAngka(selisih)} {satuan}{" "}
        masih ditahan kontrak menunggu bukti penyaluran.
      </figcaption>
    </figure>
  )
}
