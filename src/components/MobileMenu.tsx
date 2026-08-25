"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

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

      {open && (
        <nav className="absolute inset-x-0 top-full border-b border-border bg-background px-6 py-4 shadow-sm">
          <ul className="flex flex-col gap-1">
            {[...siteConfig.navLinks, { href: "/privacy", label: "プライバシーポリシー" }].map(
              (link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
