export default function Loading() {
  return (
    <main className="pt-24 md:pt-28 pb-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="skeleton h-4 w-64 max-w-full rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-12">
          <div className="lg:col-span-7">
            <div className="skeleton rounded-xl h-[360px] md:h-[560px]" />
          </div>
          <div className="lg:col-span-5 space-y-5 py-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-10 w-3/4 rounded-lg" />
            <div className="skeleton h-6 w-40 rounded" />
            <div className="skeleton h-24 w-full rounded-lg" />
            <div className="skeleton h-12 w-48 rounded-lg" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="skeleton h-14 rounded-lg" />
              <div className="skeleton h-14 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
