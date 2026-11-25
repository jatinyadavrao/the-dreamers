/** Loading states: the page's own shapes in a quiet pulse, so nothing jumps when the data lands. */
export function HeadSkeleton({ lead = true }: { lead?: boolean }) {
  return (
    <div className="grid gap-4 pt-10 pb-8 lg:pt-14 lg:pb-10" aria-hidden>
      <span className="skel h-12 w-72 max-w-full" />
      {lead && <span className="skel h-5 w-[min(560px,90%)]" />}
    </div>
  );
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="grid gap-4" aria-hidden>
      <div className="flex flex-wrap gap-3">
        <span className="skel h-11 w-[340px] max-w-full" />
        <span className="skel h-9 w-64" />
      </div>
      <div className="card divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <span className="skel h-[22px] w-[22px] rounded-full" />
            <span className="skel h-4 flex-1" style={{ maxWidth: `${40 + ((i * 37) % 40)}%` }} />
            <span className="skel hidden h-4 w-16 md:block" />
            <span className="skel hidden h-4 w-24 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <section className="wrap pb-24" role="status" aria-label="Loading">
      <HeadSkeleton />
      {children ?? <TableSkeleton />}
    </section>
  );
}

export function CompanyGridSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <div className="mb-6 flex justify-between gap-3" aria-hidden>
        <span className="skel h-11 w-[360px] max-w-full" />
        <span className="skel hidden h-9 w-56 sm:block" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="skel h-[74px] rounded-[8px]" />
        ))}
      </div>
    </div>
  );
}

export function CompanyBodySkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-12" aria-hidden>
        <span className="skel h-[240px] rounded-[8px] lg:col-span-5" />
        <span className="skel h-[240px] rounded-[8px] lg:col-span-7" />
      </div>
      <TableSkeleton />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <HeadSkeleton />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="skel h-[132px] rounded-[8px]" />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12" aria-hidden>
        <span className="skel h-[300px] rounded-[8px] lg:col-span-8" />
        <span className="skel h-[300px] rounded-[8px] lg:col-span-4" />
      </div>
    </div>
  );
}
