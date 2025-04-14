import { Skeleton } from "@/components/ui/skeleton"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <Skeleton className="h-20 w-full rounded-lg mb-6" />

          <Skeleton className="h-[400px] w-full rounded-lg mb-6" />

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
          </div>

          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}

