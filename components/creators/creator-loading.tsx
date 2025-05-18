export function CreatorLoading() {
  return (
    <div className="grid gap-8">
      {/* Profile Loading */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded-md bg-[#2A2625]" />
          <div className="h-10 w-32 animate-pulse rounded-md bg-[#2A2625]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-[#2A2625] p-6">
            <div className="mb-4 h-6 w-24 animate-pulse rounded bg-[#2A2625]" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-[#2A2625]" />
                  <div className="h-5 w-40 animate-pulse rounded bg-[#2A2625]" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#2A2625] p-6">
            <div className="mb-4 h-6 w-24 animate-pulse rounded bg-[#2A2625]" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-[#2A2625]" />
                  <div className="h-5 w-48 animate-pulse rounded bg-[#2A2625]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Campaigns Loading */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <div className="h-8 w-48 animate-pulse rounded-md bg-[#2A2625]" />
            <div className="ml-2 h-7 w-8 animate-pulse rounded-full bg-[#2A2625]" />
          </div>
        </div>
        <div className="divide-y divide-[#2A2625] rounded-md border border-[#2A2625]">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-48 animate-pulse rounded bg-[#2A2625]" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-[#2A2625]" />
                </div>
                <div className="h-4 w-96 animate-pulse rounded bg-[#2A2625]" />
                <div className="flex items-center gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 w-24 animate-pulse rounded bg-[#2A2625]" />
                  ))}
                </div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-5 w-20 animate-pulse rounded-full bg-[#2A2625]" />
                  ))}
                </div>
              </div>
              <div className="h-10 w-24 animate-pulse rounded-md bg-[#2A2625]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 