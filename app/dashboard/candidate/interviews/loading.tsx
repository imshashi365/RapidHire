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

          <div className="space-y-4">
            <Skeleton className="h-10 w-80" />

            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-10 w-[300px]" />
              <Skeleton className="h-10 w-24" />
            </div>

            <div className="rounded-md border">
              <div className="bg-slate-50 p-4">
                <div className="grid grid-cols-6 gap-4">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-4" />
                    ))}
                </div>
              </div>
              <div className="p-4 space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4">
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <Skeleton key={j} className="h-8" />
                        ))}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

