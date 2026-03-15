export function FormSkeleton({
  hasVerification = false,
}: {
  hasVerification?: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      {hasVerification && (
        <div className="flex flex-col gap-2">
          <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
          {!hasVerification && (
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
          )}
        </div>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>

      {hasVerification && (
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>
      )}

      {hasVerification && (
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      )}

      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-px flex-1 bg-muted" />
      </div>

      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="mx-auto h-4 w-48 animate-pulse rounded-md bg-muted" />
    </div>
  )
}
