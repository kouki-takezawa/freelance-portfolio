export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 400"
      className="w-full max-w-md mx-auto"
      role="img"
      aria-label="開発ブロックが積み上がるアイソメトリックイラスト"
    >
      {/* platform */}
      <polygon
        points="240,120 430.5,230 240,340 49.5,230"
        fill="var(--color-surface)"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />

      {/* cube 1 (back left) */}
      <g className="hero-float" style={{ animationDelay: "-1.5s" }}>
        {/* connecting dots (left cube) */}
        <g stroke="#9DB8D6" strokeWidth="2">
          <line x1="80" y1="150" x2="80" y2="118" />
          <line x1="80" y1="118" x2="52" y2="100" />
        </g>
        <circle cx="80" cy="150" r="4" fill="#9DB8D6" />
        <circle cx="80" cy="118" r="4" fill="#9DB8D6" />
        <circle cx="52" cy="100" r="4" fill="#9DB8D6" />

        <polygon points="144.75,64 193.25,92 144.75,120 96.25,92" fill="#6FA0D6" />
        <polygon points="96.25,92 144.75,120 144.75,175 96.25,147" fill="#1E3A5F" />
        <polygon points="193.25,92 144.75,120 144.75,175 193.25,147" fill="#2F5A8A" />
      </g>

      {/* cube 2 (center, tallest) */}
      <g className="hero-float" style={{ animationDelay: "0s" }}>
        <polygon points="240,77 298.9,111 240,145 181.1,111" fill="#7FB0E0" />
        <polygon points="181.1,111 240,145 240,230 181.1,196" fill="#1E3A5F" />
        <polygon points="298.9,111 240,145 240,230 298.9,196" fill="#2F5A8A" />

        {/* checkmark badge floating above center cube */}
        <circle cx="322" cy="70" r="22" fill="#ffffff" stroke="#1E3A5F" strokeWidth="2" />
        <path
          d="M312 70 L319 77 L333 62"
          fill="none"
          stroke="#1E3A5F"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* cube 3 (front right, small) */}
      <g className="hero-float" style={{ animationDelay: "-3s" }}>
        <polygon points="335.25,203 373.35,225 335.25,247 297.15,225" fill="#6FA0D6" />
        <polygon points="297.15,225 335.25,247 335.25,285 297.15,263" fill="#1E3A5F" />
        <polygon points="373.35,225 335.25,247 335.25,285 373.35,263" fill="#2F5A8A" />
      </g>
    </svg>
  );
}
