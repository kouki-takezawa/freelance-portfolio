import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} {siteConfig.siteName}
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
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
      </div>
    </footer>
  );
}
