"use client";

import { Icon } from "./Icon";

export function ContactWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp CTA */}
      <a
        href="https://wa.me/919460300750?text=Hi%20JR%20Interiors,%20I'd%20like%20to%20inquire%20about%20your%20luxury%20furniture%20and%20design%20services."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform active:scale-95"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.978 14.12 .953 11.5 .953c-5.44 0-9.866 4.372-9.87 9.802 0 1.83.504 3.614 1.46 5.171l-1.007 3.68 3.773-.979zm11.215-6.85c-.327-.162-1.928-.938-2.222-1.045-.294-.107-.508-.162-.722.162-.214.325-.829 1.045-1.016 1.258-.187.214-.374.24-.701.079-.327-.162-1.38-.501-2.63-1.602-.973-.855-1.63-1.912-1.821-2.237-.191-.325-.02-.501.141-.661.145-.143.327-.376.49-.564.163-.189.217-.324.327-.539.11-.217.056-.405-.027-.568-.084-.162-.722-1.712-.99-2.353-.26-.624-.527-.539-.722-.549l-.617-.008c-.214 0-.562.08-.856.402-.294.324-1.123 1.085-1.123 2.648 0 1.563 1.15 3.072 1.31 3.287.16.214 2.261 3.41 5.476 4.778.765.325 1.362.52 1.828.666.77.243 1.472.21 2.028.127.62-.093 1.928-.78 2.2-1.498.272-.717.272-1.332.191-1.498-.081-.162-.294-.26-.621-.422z" />
        </svg>
      </a>

      {/* Phone Call CTA */}
      <a
        href="tel:+919460300750"
        aria-label="Call Customer Support"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg hover:scale-110 transition-transform active:scale-95"
      >
        <Icon name="phone" className="h-5 w-5" />
      </a>
    </div>
  );
}
