import { siteConfig } from "@/lib/site";

export default function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={siteConfig.instagramUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform duration-200 hover:-translate-y-0.5 hover:scale-110 hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)" }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={siteConfig.threadsUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Threads"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-transform duration-200 hover:-translate-y-0.5 hover:scale-110 hover:opacity-90 active:scale-95"
      >
        <span className="text-base font-bold leading-none" aria-hidden="true">@</span>
      </a>
    </div>
  );
}
