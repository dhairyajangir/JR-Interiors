import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pt-32 pb-stack-lg min-h-[70vh] flex items-center">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block">Lost the thread</span>
        <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-primary mb-6">
          404
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mx-auto mb-10">
          This page has drifted out of the collection. Let&rsquo;s guide you back to calm.
        </p>
        <Link href="/" className="inline-block bg-primary text-on-primary px-10 py-4 rounded-lg font-label-sm hover:opacity-90 transition">
          Return Home
        </Link>
      </div>
    </main>
  );
}
