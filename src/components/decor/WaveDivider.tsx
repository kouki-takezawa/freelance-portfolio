// セクション間の直線ボーダーの代わりに使う、有機的な波形の区切り。
// 親要素の背景色 = 上のセクションの色、text色(currentColor) = 下のセクションの色として使う。
export default function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden leading-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="block h-8 w-full sm:h-12"
      >
        <path
          d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,32 L1440,60 L0,60 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
