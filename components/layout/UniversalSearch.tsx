"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SearchIcon,
  UserIcon,
  BookOpen01Icon,
  UserMultiple02Icon,
  Briefcase02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";

type SearchResultType = "Student" | "Staff" | "Class" | "Subject";

/**
 * variant="default"  — compact search for top bar / inline use
 * variant="banner"   — large search with maroon button, like PwC Digital Lab
 */
type UniversalSearchProps = {
  variant?: "default" | "banner";
};

export function UniversalSearch({ variant = "default" }: UniversalSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedTerm] = useDebounce(searchTerm, 300);
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Auto-close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const rawResults = useQuery(api.search.universal, {
    query: debouncedTerm,
  });

  const isLoading = debouncedTerm.length >= 2 && rawResults === undefined;
  const hasResults = rawResults && rawResults.length > 0;

  // Group results by type
  const groupedResults = React.useMemo(() => {
    if (!rawResults || rawResults.length === 0)
      return {} as Record<SearchResultType, any[]>;
    type ResultType = NonNullable<typeof rawResults>[number];
    return rawResults.reduce(
      (acc, result) => {
        const typeAcc = acc[result.type] || [];
        typeAcc.push(result);
        acc[result.type] = typeAcc;
        return acc;
      },
      {} as Record<SearchResultType, ResultType[]>,
    );
  }, [rawResults]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setSearchTerm("");
    router.push(href);
  };

  const getIconForType = (type: SearchResultType) => {
    switch (type) {
      case "Student":
        return UserIcon;
      case "Staff":
        return Briefcase02Icon;
      case "Class":
        return UserMultiple02Icon;
      case "Subject":
        return BookOpen01Icon;
    }
  };

  const showDropdown = isOpen && debouncedTerm.length >= 2;
  const isBanner = variant === "banner";

  return (
    <div ref={wrapperRef} className="relative w-full group">
      {/* Search input row */}
      <div
        className="flex items-stretch w-full overflow-hidden"
        style={{
          borderRadius: showDropdown
            ? "var(--radius-md-token) var(--radius-md-token) 0 0"
            : "var(--radius-md-token)",
          background: "var(--color-surface-primary)",
          boxShadow: isBanner ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
        }}
      >
        {/* Input field */}
        <div className="relative flex-1">
          {!isBanner && (
            <HugeiconsIcon
              icon={SearchIcon}
              strokeWidth={2}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4"
              style={{ color: "var(--color-accent-primary)" }}
            />
          )}
          <Input
            type="search"
            placeholder="Search students, classes, or subjects..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (searchTerm.trim().length >= 2) {
                setIsOpen(true);
              }
            }}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            style={{
              height: isBanner ? "52px" : "36px",
              paddingLeft: isBanner ? "var(--space-lg)" : "40px",
              paddingRight: "var(--space-md)",
              borderRadius: "0",
              fontFamily: "var(--font-family-body)",
              fontSize: isBanner
                ? "var(--font-size-body)"
                : "var(--font-size-caption)",
              color: "var(--color-text-body)",
              background: "transparent",
            }}
          />
        </div>
        {/* Search button — solid maroon, like PwC's orange button */}
        <button
          type="button"
          className="flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
          style={{
            width: isBanner ? "52px" : "40px",
            background: "var(--color-accent-primary)",
            color: "var(--color-text-inverse)",
          }}
          onClick={() => {
            if (searchTerm.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          aria-label="Search"
        >
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2.5}
            className={isBanner ? "size-5" : "size-4"}
          />
        </button>
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 w-full overflow-hidden z-50 overflow-y-auto flex flex-col"
          style={{
            background: "var(--color-surface-primary)",
            borderTop: "1px solid var(--color-border-default)",
            borderRadius: "0 0 var(--radius-md-token) var(--radius-md-token)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            maxHeight: "400px",
          }}
        >
          {isLoading && (
            <div
              className="flex items-center justify-center"
              style={{
                padding: "var(--space-lg)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-body)",
              }}
            >
              <Spinner className="mr-2" />
              Searching...
            </div>
          )}

          {!isLoading && !hasResults && (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                padding: "var(--space-xl)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-body)",
              }}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="size-8"
                style={{
                  marginBottom: "var(--space-sm)",
                  color: "var(--color-text-placeholder)",
                }}
              />
              <p>No results found for &quot;{debouncedTerm}&quot;</p>
            </div>
          )}

          {!isLoading && hasResults && (
            <div
              className="flex flex-col"
              style={{ padding: "var(--space-sm)", gap: "var(--space-md)" }}
            >
              {(Object.keys(groupedResults) as SearchResultType[]).map(
                (type) => {
                  const results = groupedResults[type];
                  if (!results || results.length === 0) return null;

                  const Icon = getIconForType(type);

                  return (
                    <div key={type} className="flex flex-col">
                      <h4
                        style={{
                          padding: "var(--space-xs) var(--space-sm)",
                          fontSize: "var(--font-size-tag)",
                          fontFamily: "var(--font-family-body)",
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--color-text-secondary)",
                          letterSpacing: "var(--letter-spacing-uppercase)",
                          textTransform: "uppercase",
                          background: "var(--color-surface-secondary)",
                          borderRadius: "var(--radius-sm-token)",
                        }}
                      >
                        {type}s
                      </h4>
                      <div
                        className="flex flex-col"
                        style={{ marginTop: "var(--space-xs)", gap: "2px" }}
                      >
                        {results?.map((result: any) => (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result.href)}
                            className="flex items-center w-full text-left transition-colors group/item focus:outline-none"
                            style={{
                              gap: "var(--space-sm)",
                              padding: "var(--space-sm)",
                              borderRadius: "var(--radius-sm-token)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--color-surface-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <div
                              className="flex items-center justify-center shrink-0 rounded-full"
                              style={{
                                width: "32px",
                                height: "32px",
                                background: "rgba(139, 30, 30, 0.08)",
                                color: "var(--color-accent-primary)",
                              }}
                            >
                              <HugeiconsIcon icon={Icon} className="size-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                className="truncate block"
                                style={{
                                  fontFamily: "var(--font-family-body)",
                                  fontSize: "var(--font-size-body)",
                                  fontWeight: "var(--font-weight-medium)",
                                  color: "var(--color-text-body)",
                                }}
                              >
                                {result.title}
                              </span>
                              <span
                                className="truncate block"
                                style={{
                                  fontFamily: "var(--font-family-body)",
                                  fontSize: "var(--font-size-tag)",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {result.subtitle}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
