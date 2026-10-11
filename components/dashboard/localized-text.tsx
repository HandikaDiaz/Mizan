"use client"

import { useLanguage } from "@/components/site/language-provider"

export function LocalizedText({ text }: { text: string }) {
  const { t } = useLanguage()
  return <>{t(text)}</>
}
