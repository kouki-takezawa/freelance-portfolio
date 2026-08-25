import Link from "next/link";
import { siteConfig } from "@/lib/site";
import LineButton from "@/components/LineButton";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-bold">{siteConfig.siteName}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.tagline}
            </p>
            <p className="mt-3 text-xs text-muted">対応エリア: {siteConfig.serviceArea}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground/70">最新情報・お問い合わせはLINEでも</p>
            <div className="mt-3">
              <LineButton />
            </div>
          </div>
        </div>

        <nav className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-8 text-sm text-muted sm:grid-cols-4">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/privacy" className="transition-colors hover:text-accent">
            プライバシーポリシー
          </Link>
        </nav>

        <p className="mt-8 border-t border-border pt-6 text-xs text-muted">
          &copy; {year} {siteConfig.siteName}
        </p>
      </div>
    </footer>
  );
}
