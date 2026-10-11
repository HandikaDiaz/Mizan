"use client"

import { useLanguage } from "@/components/site/language-provider"

type SkeletonProps = { className?: string }

function Bar({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-sunken ${className}`}
    />
  )
}

function LoadingStatus({ label = "Memuat halaman…" }: { label?: string }) {
  const { t } = useLanguage()
  return (
    <span className="sr-only" role="status" aria-live="polite">
      {t(label)}
    </span>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-line-soft bg-surface p-5"
          >
            <Bar className="h-3 w-24" />
            <Bar className="mt-4 h-8 w-32" />
          </div>
        ))}
      </div>
      <ListSkeleton />
      <LoadingStatus />
    </div>
  )
}

export function ListPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <HeaderSkeleton />
      <div className="rounded-2xl border border-line-soft bg-surface p-6">
        <div className="mb-6 flex gap-3">
          <Bar className="h-10 flex-1" />
          <Bar className="h-10 w-32" />
        </div>
        <ListSkeletonRows />
      </div>
      <LoadingStatus />
    </div>
  )
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-[720px] space-y-8">
      <HeaderSkeleton />
      {Array.from({ length: 4 }).map((_, i) => (
        <section
          key={i}
          className="rounded-2xl border border-line-soft bg-surface p-6 sm:p-8"
        >
          <Bar className="h-6 w-48" />
          <Bar className="mt-6 h-12 w-full" />
          <Bar className="mt-4 h-12 w-full" />
          <Bar className="mt-4 h-28 w-full" />
        </section>
      ))}
      <LoadingStatus />
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1040px] space-y-8">
      <Bar className="h-4 w-32" />
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <InfoSkeleton />
          <InfoSkeleton />
        </div>
        <aside className="rounded-2xl border border-line-soft bg-surface p-6">
          <Bar className="h-3 w-24" />
          <Bar className="mt-4 h-6 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-line-soft py-4">
              <Bar className="h-3 w-24" />
              <Bar className="mt-2 h-4 w-36" />
            </div>
          ))}
        </aside>
      </div>
      <LoadingStatus />
    </div>
  )
}

export function MilestonePageSkeleton() {
  return (
    <div className="mx-auto max-w-[1040px] space-y-8">
      <Bar className="h-4 w-32" />
      <HeaderSkeleton />
      {Array.from({ length: 4 }).map((_, i) => (
        <section
          key={i}
          className="rounded-2xl border border-line-soft bg-surface p-6"
        >
          <div className="flex items-center justify-between">
            <Bar className="h-6 w-2/3" />
            <Bar className="h-8 w-24 rounded-full" />
          </div>
          <Bar className="mt-5 h-4 w-1/2" />
          <Bar className="mt-4 h-20 w-full" />
        </section>
      ))}
      <LoadingStatus />
    </div>
  )
}

export function PublicPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-[1240px] px-5 py-12">
        <HeaderSkeleton />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-line-soft bg-surface"
            >
              <Bar className="aspect-[16/9] rounded-none" />
              <div className="space-y-4 p-6">
                <Bar className="h-4 w-24" />
                <Bar className="h-6 w-3/4" />
                <Bar className="h-4 w-full" />
                <Bar className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <LoadingStatus />
      </div>
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div>
      <Bar className="h-3 w-28" />
      <Bar className="mt-4 h-10 w-72" />
      <Bar className="mt-3 h-4 w-96 max-w-full" />
    </div>
  )
}

function ListSkeleton() {
  return (
    <section className="rounded-2xl border border-line-soft bg-surface p-6">
      <Bar className="h-6 w-48" />
      <Bar className="mt-3 h-4 w-72" />
      <div className="mt-7">
        <ListSkeletonRows />
      </div>
    </section>
  )
}

function ListSkeletonRows() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line-soft pb-5"
        >
          <div className="flex-1">
            <Bar className="h-4 w-2/3" />
            <Bar className="mt-2 h-3 w-1/3" />
          </div>
          <Bar className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

function InfoSkeleton() {
  return (
    <section className="rounded-2xl border border-line-soft bg-surface p-7">
      <Bar className="h-6 w-48" />
      <Bar className="mt-5 h-4 w-full" />
      <Bar className="mt-3 h-4 w-5/6" />
      <Bar className="mt-3 h-4 w-2/3" />
    </section>
  )
}
