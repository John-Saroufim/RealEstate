import React from "react";

/**
 * Minimal luxury “house with chimney” icon.
 * Uses `currentColor` so it inherits Tailwind `text-*` color (e.g. gold).
 */
export function MontelibanoHouseLogo(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={props.className}
    >
      {/* Chimney */}
      <path d="M14 4v3" />
      <path d="M10 9h8" />
      <path d="M14 7h2v4h-2z" />

      {/* Roof */}
      <path d="M3 10.5 12 3l9 7.5" />

      {/* House body */}
      <path d="M5 10.5V21h14V10.5" />

      {/* Door (subtle) */}
      <path d="M10 21v-7h4v7" />
    </svg>
  );
}

