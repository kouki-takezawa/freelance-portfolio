import Link from "next/link";
import { siteConfig } from "@/lib/site";
import MobileMenu from "@/components/MobileMenu";

export default function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Link href="/" className="text-base font-bold tracking-tight sm:text-lg">
            {siteConfig.siteNameShort}
          </Link>
        </div>
        <nav
          aria-label="メインナビゲーション"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium"
        >
          {siteConfig.primaryNavLinks
            .filter((link) => link.href !== "/contact")
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hidden text-foreground/80 transition-colors hover:text-accent sm:inline"
              >
                {link.label}
              </Link>
            ))}
          <Link
            href="/contact"
            className="rounded-full bg-accent px-4 py-1.5 text-accent-foreground transition-opacity hover:opacity-90"
          >
            相談する
          </Link>
        </nav>
      </div>
    </header>
  );
}
