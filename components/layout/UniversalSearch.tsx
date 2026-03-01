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
import { cn } from "@/lib/utils";

type SearchResultType = "Student" | "Staff" | "Class" | "Subject";

export function UniversalSearch() {
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

  return (
    <div ref={wrapperRef} className="relative w-full group">
      <HugeiconsIcon
        icon={SearchIcon}
        strokeWidth={2}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brand-primary"
      />
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
        className={cn(
          "pl-10 h-10 w-full bg-transparent border-2 border-brand-primary/50 text-foreground placeholder:text-muted-foreground hover:border-brand-primary focus-visible:ring-0 focus-visible:border-brand-primary transition-all shadow-sm",
          isOpen && debouncedTerm.length >= 2
            ? "rounded-t-2xl rounded-b-none border-b-transparent"
            : "rounded-full",
        )}
      />

      {isOpen && debouncedTerm.length >= 2 && (
        <div className="absolute top-full left-0 right-0 w-full bg-white dark:bg-zinc-900 border-2 border-t-0 border-brand-primary rounded-b-2xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto flex flex-col">
          {isLoading && (
            <div className="flex items-center justify-center p-6 text-muted-foreground">
              <Spinner className="mr-2" />
              Searching...
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="mb-2 size-8 text-brand-primary/30"
              />
              <p>No results found for "{debouncedTerm}"</p>
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="flex flex-col p-2 space-y-4">
              {(Object.keys(groupedResults) as SearchResultType[]).map(
                (type) => {
                  const results = groupedResults[type];
                  if (!results || results.length === 0) return null;

                  const Icon = getIconForType(type);

                  return (
                    <div key={type} className="flex flex-col">
                      <h4 className="px-3 py-1.5 text-xs font-semibold text-muted-foreground tracking-wider uppercase bg-muted/30 rounded-md">
                        {type}s
                      </h4>
                      <div className="mt-1 flex flex-col gap-1">
                        {results?.map((result: any) => (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result.href)}
                            className="flex items-center w-full gap-3 px-3 py-2 text-left hover:bg-brand-primary/10 rounded-md transition-colors group/item focus:bg-brand-primary/10 focus:outline-none"
                          >
                            <div className="flex items-center justify-center size-8 rounded-full bg-brand-primary/10 text-brand-primary group-hover/item:bg-brand-primary group-hover/item:text-white transition-colors shrink-0">
                              <HugeiconsIcon icon={Icon} className="size-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-foreground truncate block">
                                {result.title}
                              </span>
                              <span className="text-xs text-muted-foreground truncate block">
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
