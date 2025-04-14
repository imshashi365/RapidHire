import { Skeleton } from "@/components/ui/skeleton"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <main className="flex-1 container py-6">
        <Skeleton className="h-[600px] max-w-2xl mx-auto rounded-lg" />
      </main>
    </div>
  )
}

