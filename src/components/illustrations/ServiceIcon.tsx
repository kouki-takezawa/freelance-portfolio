import type { ReactNode } from "react";

type Kind = "hp" | "lp" | "system";

const paths: Record<Kind, ReactNode> = {
  hp: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <line x1="3" y1="8" x2="21" y2="8" />
      <circle cx="5.5" cy="6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="6" r="0.6" fill="currentColor" stroke="none" />
      <line x1="9" y1="21" x2="15" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  lp: (
    <>
      <path d="M3 11l14-6v14L3 13z" />
      <path d="M17 8.5a3.5 3.5 0 010 7" />
      <line x1="7" y1="13" x2="7" y2="17.5" />
      <path d="M7 17.5a2 2 0 004 0" />
    </>
  ),
  system: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6" />
    </>
  ),
};

export default function ServiceIcon({ kind }: { kind: Kind }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}
