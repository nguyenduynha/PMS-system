export default function Loading() {
  return (
    <div className="flex min-h-screen bg-background" role="status" aria-label="Đang tải trang">
      <div className="hidden w-64 shrink-0 border-r bg-card md:block" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-[76px] border-b bg-card" />
        <main className="flex-1 p-6">
          <div className="mb-6 h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl border bg-muted/60" />
            ))}
          </div>
          <div className="mt-6 h-80 animate-pulse rounded-xl border bg-muted/50" />
        </main>
      </div>
      <span className="sr-only">Đang tải dữ liệu...</span>
    </div>
  )
}
