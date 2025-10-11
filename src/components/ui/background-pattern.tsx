import React from "react";

export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden pointer-events-none">
      <svg
        className="absolute h-full w-full text-slate-300"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="smallCrosses"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M5 0L5 10M0 5L10 5"
              stroke="currentColor"
              strokeWidth="0.5"
              className="opacity-30"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#smallCrosses)" />
      </svg>
    </div>
  );
} 