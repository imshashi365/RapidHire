import { Skeleton } from "@/components/ui/skeleton"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <div className="flex flex-1">
        <CandidateDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          <Skeleton className="h-10 w-80 mb-4" />

          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
              ))}
          </div>
        </main>
      </div>
    </div>
  )
}

