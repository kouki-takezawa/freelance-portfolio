"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // `open` only ever becomes true via a client-side click, so document
  // is always available by the time this is rendered — no SSR/mount
  // guard needed for the portal target.
  const overlay = (
    <nav className="fixed inset-x-0 top-[69px] bottom-0 z-50 overflow-y-auto bg-background px-6 py-4 sm:hidden">
      <ul className="flex flex-col gap-1">
        {[...siteConfig.navLinks, { href: "/privacy", label: "プライバシーポリシー" }].map(
          (link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </nav>
  );

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-border"
      >
        <span
          className={`block h-0.5 w-[18px] bg-foreground transition-transform ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-[18px] bg-foreground transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-[18px] bg-foreground transition-transform ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {/* header has backdrop-blur, which changes the containing block for
          position:fixed descendants — portal out to <body> so this overlay
          positions relative to the real viewport instead of the header. */}
      {open && createPortal(overlay, document.body)}
    </div>
  );
}
