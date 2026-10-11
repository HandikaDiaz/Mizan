import { openRouter } from "../lib/openRouter"

const CANDIDATE_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "qwen/qwen3.8-27b:free",
  "dots-studio/dots-3-note-preview:free",
  "thinkingmachines/inkling-small:free",
]

export async function callWithFallback(
  prompt: string
): Promise<string | null> {
  for (const model of CANDIDATE_MODELS) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    const t0 = Date.now()

    try {
      const response = await openRouter.chat.completions.create(
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah asisten yang membalas HANYA dengan JSON valid sesuai instruksi.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_object",
          },
        },
        {
          signal: controller.signal,
        }
      )

      const content = response?.choices?.[0]?.message?.content

      if (!content) {
        console.warn(
          `[aiCampaign] model=${model} tidak menghasilkan content setelah ${
            Date.now() - t0
          }ms, coba model berikutnya`
        )

        continue
      }

      console.log("[AI TOKEN USAGE]", {
        model,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      })

      console.log(
        `[aiCampaign] model=${model} latency=${Date.now() - t0}ms OK`
      )

      return content
    } catch (err: any) {
      const status = err?.status ?? err?.code
      const errorMessage =
        err?.error?.message ??
        err?.message ??
        ""

      const errorType = err?.error?.metadata?.error_type

      // ==========================================
      // FREE MODEL DAILY LIMIT
      // ==========================================
      if (
        status === 429 &&
        errorMessage.includes("free-models-per-day")
      ) {
        console.error(
          `[aiCampaign] model=${model} FREE DAILY LIMIT HABIS. Stop fallback.`
        )

        return null
      }

      // ==========================================
      // PROVIDER OVERLOADED
      // ==========================================
      if (
        status === 503 ||
        errorType === "provider_overloaded"
      ) {
        console.warn(
          `[aiCampaign] model=${model} provider overloaded setelah ${
            Date.now() - t0
          }ms, coba model berikutnya`
        )

        continue
      }

      // ==========================================
      // TIMEOUT
      // ==========================================
      if (err?.name === "AbortError") {
        console.warn(
          `[aiCampaign] model=${model} timeout setelah ${
            Date.now() - t0
          }ms, coba model berikutnya`
        )

        continue
      }

      // ==========================================
      // ERROR LAIN
      // ==========================================
      console.warn(
        `[aiCampaign] model=${model} gagal setelah ${
          Date.now() - t0
        }ms, coba model berikutnya`,
        err
      )

      continue
    } finally {
      clearTimeout(timeout)
    }
  }

  console.error("[aiCampaign] semua model fallback gagal")

  return null
}