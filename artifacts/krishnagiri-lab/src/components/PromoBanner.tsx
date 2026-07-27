import { Sparkles, BadgePercent } from "lucide-react";

/**
 * Running (marquee) promo banner shown on the Home page.
 * Announces the AAROGYA WELLNESS CARD offer. Scrolls continuously,
 * pauses on hover, and stops for users who prefer reduced motion.
 */
export function PromoBanner() {
  const Message = () => (
    <span className="inline-flex items-center gap-2.5 px-6 text-sm sm:text-base font-semibold tracking-wide">
      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-yellow-300" />
      <span>
        With the{" "}
        <span className="font-extrabold text-yellow-300">AAROGYA WELLNESS CARD</span>
      </span>
      <span className="mx-1 opacity-60">•</span>
      <BadgePercent className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-yellow-300" />
      <span>
        <span className="font-extrabold">SPECIAL OFFER:</span> FLAT{" "}
        <span className="font-extrabold text-yellow-300">25% OFF</span> on all Blood &amp; Urine Tests
      </span>
      <span className="mx-3 opacity-40">|</span>
    </span>
  );

  return (
    <div
      className="pathofix-marquee relative w-full overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground shadow-sm cursor-pointer"
      role="region"
      aria-label="Special offer — click to learn more"
      onClick={() => document.getElementById("aarogya")?.scrollIntoView({ behavior: "smooth" })}
    >
      <div className="pathofix-marquee-track py-2.5">
        {/* Two identical halves make the scroll loop seamlessly */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Message key={i} />
        ))}
      </div>
      {/* Soft fade at the edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-secondary to-transparent" />
    </div>
  );
}
