"use client";

/**
 * Inline SVG logo for Peek — a green circle with a white compass/explore icon.
 * Uses inline SVG so it doesn't depend on static files in /public.
 */
export function PeekLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="28" fill="#00C896" />
      <path
        d="M28 16a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.3 6.7-3 7.6-7.6 3 3-7.6 7.6-3zM28 29.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z"
        fill="white"
      />
    </svg>
  );
}
