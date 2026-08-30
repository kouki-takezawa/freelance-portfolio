"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { siteConfig } from "@/lib/site";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // 開いている間: 最初のリンクへフォーカス移動、Tabをパネル内に閉じ込め、
  // Escで閉じてトグルボタンへフォーカスを戻し、背面スクロールを止める。
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusable[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        ref={toggleRef}
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
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.nav
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="メニュー"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-x-0 top-[69px] bottom-0 z-50 overflow-y-auto bg-background px-6 py-4 sm:hidden"
              >
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
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
