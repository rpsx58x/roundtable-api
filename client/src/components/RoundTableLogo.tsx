interface LogoProps {
  size?: "sm" | "default" | "lg" | "xl";
  textClass?: string;
  showText?: boolean;
}

export function RoundTableLogo({ size = "default", textClass, showText = true }: LogoProps) {
  const dim = { sm: 24, default: 30, lg: 36, xl: 48 }[size];
  const fontSize = { sm: "text-base", default: "text-lg", lg: "text-xl", xl: "text-2xl" }[size];
  const bgColor = "hsl(40, 78%, 42%)";

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* RoundTable icon — overhead view of a round table with 6 seats */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 32 32"
        fill="none"
        aria-label="RoundTable"
        role="img"
        style={{ flexShrink: 0 }}
      >
        {/* Rounded-square background */}
        <rect width="32" height="32" rx="8" fill={bgColor} />

        {/* Subtle ring connecting table to seats */}
        <circle
          cx="16" cy="16" r="9.8"
          stroke="white"
          strokeWidth="0.6"
          opacity="0.25"
          fill="none"
        />

        {/* Table surface */}
        <circle cx="16" cy="16" r="5.2" fill="white" opacity="0.96" />

        {/* 6 seats evenly distributed at r=9.8 */}
        {/* 0°   */ }
        <circle cx="25.8" cy="16"   r="2.3" fill="white" opacity="0.90" />
        {/* 60°  */}
        <circle cx="20.9" cy="24.5" r="2.3" fill="white" opacity="0.90" />
        {/* 120° */}
        <circle cx="11.1" cy="24.5" r="2.3" fill="white" opacity="0.90" />
        {/* 180° */}
        <circle cx="6.2"  cy="16"   r="2.3" fill="white" opacity="0.90" />
        {/* 240° */}
        <circle cx="11.1" cy="7.5"  r="2.3" fill="white" opacity="0.90" />
        {/* 300° */}
        <circle cx="20.9" cy="7.5"  r="2.3" fill="white" opacity="0.90" />
      </svg>

      {showText && (
        <span
          className={`font-semibold tracking-tight leading-none ${fontSize} ${textClass ?? "text-foreground"}`}
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          RoundTable
        </span>
      )}
    </div>
  );
}

/** Stand-alone mark-only version (no text, for small contexts) */
export function RoundTableMark({ dim = 32 }: { dim?: number }) {
  return (
    <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" aria-label="RoundTable">
      <rect width="32" height="32" rx="8" fill="hsl(40, 78%, 42%)" />
      <circle cx="16" cy="16" r="9.8" stroke="white" strokeWidth="0.6" opacity="0.25" fill="none" />
      <circle cx="16" cy="16" r="5.2" fill="white" opacity="0.96" />
      <circle cx="25.8" cy="16"   r="2.3" fill="white" opacity="0.90" />
      <circle cx="20.9" cy="24.5" r="2.3" fill="white" opacity="0.90" />
      <circle cx="11.1" cy="24.5" r="2.3" fill="white" opacity="0.90" />
      <circle cx="6.2"  cy="16"   r="2.3" fill="white" opacity="0.90" />
      <circle cx="11.1" cy="7.5"  r="2.3" fill="white" opacity="0.90" />
      <circle cx="20.9" cy="7.5"  r="2.3" fill="white" opacity="0.90" />
    </svg>
  );
}
