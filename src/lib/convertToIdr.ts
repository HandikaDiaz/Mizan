const WEI_PER_BNB = BigInt(1_000_000_000_000_000_000)

export async function convertIdrToWeiBnb(amountIdr: number): Promise<string> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=idr"
  )

  if (!res.ok) {
    throw new Error(`Gagal ambil kurs BNB/IDR: ${res.status}`)
  }

  const data = await res.json()
  const idrPerBnb: number | undefined = data?.binancecoin?.idr

  if (!idrPerBnb) {
    throw new Error("Respons kurs BNB/IDR tidak valid")
  }

  const bnbAmount = amountIdr / idrPerBnb
  const weiAmount =
    BigInt(Math.round(bnbAmount * 1e6)) * (WEI_PER_BNB / BigInt(1_000_000))
  return weiAmount.toString()
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}