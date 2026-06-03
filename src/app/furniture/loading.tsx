export default function Loading() {
  return (
    <main className="pt-32 pb-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-stack-md space-y-3">
          <div className="skeleton h-10 w-80 max-w-full rounded-lg" />
          <div className="skeleton h-4 w-full max-w-xl rounded" />
        </div>
        <div className="flex flex-col md:flex-row gap-gutter">
          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-[4/5] rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
