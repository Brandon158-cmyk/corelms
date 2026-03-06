"use client";

import { UniversalSearch } from "@/components/layout/UniversalSearch";

/**
 * PageBanner — Two variants per the Design Language Guide's Hero Section.
 *
 * "hero"    → Full-height banner with background image, dark overlay, serif heading,
 *             description, and integrated search bar. For main landing pages (Dashboard Home).
 *
 * "compact" → Shorter banner with the same dark overlay styling, page title, and search bar.
 *             For module/sub-pages (Students, Classes, Gradebook, etc.).
 */
type PageBannerProps = {
  variant: "hero" | "compact";
  title: string;
  subtitle?: string;
  /** Optional — only used for hero variant. Defaults to /hero-banner.jpg */
  backgroundImage?: string;
};

export function PageBanner({
  variant,
  title,
  subtitle,
  backgroundImage = "/hero-banner.jpg",
}: PageBannerProps) {
  if (variant === "hero") {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: "0 0 var(--radius-lg-token) var(--radius-lg-token)",
          minHeight: "220px",
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        {/* Dark overlay — per design guide: rgba(30,20,40,0.65), NOT a gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "var(--color-overlay-dark)" }}
        />
        {/* Geometric stripe — antique gold, diagonal, upper-right */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: "120px",
            height: "120px",
            background: `linear-gradient(135deg, var(--color-geo-stripe) 0%, var(--color-geo-stripe) 50%, transparent 50%)`,
            opacity: 0.7,
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col justify-end"
          style={{
            padding: "var(--space-xl)",
            minHeight: "220px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-family-heading)",
              fontSize: "var(--font-size-hero)",
              fontWeight: "var(--font-weight-bold)",
              lineHeight: "var(--line-height-tight)",
              color: "var(--color-text-inverse)",
              marginBottom: "var(--space-sm)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-body)",
                color: "var(--color-text-inverse)",
                opacity: 0.85,
                lineHeight: "var(--line-height-relaxed)",
                maxWidth: "500px",
                marginBottom: "var(--space-lg)",
              }}
            >
              {subtitle}
            </p>
          )}
          {/* Search bar */}
          <div className="w-full" style={{ maxWidth: "480px" }}>
            <UniversalSearch variant="banner" />
          </div>
        </div>
      </div>
    );
  }

  // Compact variant — shorter bar with dark bg, title + search
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        borderRadius: "0 0 var(--radius-lg-token) var(--radius-lg-token)",
        background: "var(--color-nav-bg)",
        padding: "var(--space-lg) var(--space-xl)",
      }}
    >
      {/* Subtle geometric stripe — upper-right */}
      <div
        className="absolute top-0 right-0"
        style={{
          width: "80px",
          height: "80px",
          background: `linear-gradient(135deg, var(--color-geo-stripe) 0%, var(--color-geo-stripe) 50%, transparent 50%)`,
          opacity: 0.5,
        }}
      />

      <div
        className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between"
        style={{ gap: "var(--space-md)" }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-family-heading)",
              fontSize: "var(--font-size-section-heading)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text-inverse)",
              lineHeight: "var(--line-height-tight)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-inverse)",
                opacity: 0.7,
                marginTop: "var(--space-xs)",
                lineHeight: "var(--line-height-normal)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {/* Search bar */}
        <div
          className="w-full sm:w-auto"
          style={{ maxWidth: "360px", minWidth: "280px" }}
        >
          <UniversalSearch variant="banner" />
        </div>
      </div>
    </div>
  );
}
