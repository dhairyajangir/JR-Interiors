// components/SkipToContent.tsx
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="absolute left-0 bg-primary text-on-primary px-4 py-2 text-label-sm font-bold z-[100] -translate-y-full focus:translate-y-0 transition-transform duration-200 outline-none shadow-md"
    >
      Skip to main content
    </a>
  );
}
