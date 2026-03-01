"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTermFilter } from "@/components/providers/TermFilterProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SchoolIcon,
  UnfoldMoreIcon,
  Tick02Icon,
  Calendar03Icon,
  InfinityCircleIcon,
} from "@hugeicons/core-free-icons";

export function TermSwitcher() {
  const user = useQuery(api.users.currentUser);
  const years = useQuery(api.academicYears.list);
  const allTerms = useQuery(api.terms.list, {});
  const {
    mode,
    selectedYearIds,
    selectedTermIds,
    selectAllTime,
    selectYear,
    selectTerm,
    filterLabel,
    setFilterLabel,
  } = useTermFilter();

  const schoolName = user?.tenant?.name || "My School";

  // Compute the display label based on current filter
  const displayLabel = React.useMemo(() => {
    if (mode === "all-time") return "All Time";

    if (mode === "years" && selectedYearIds.length > 0 && years) {
      const selectedYears = years.filter((y) =>
        selectedYearIds.includes(y._id),
      );
      if (selectedYears.length === 1) return selectedYears[0].name;
      return `${selectedYears.length} years selected`;
    }

    if (mode === "terms" && selectedTermIds.length > 0 && allTerms) {
      const selectedTerms = allTerms.filter((t) =>
        selectedTermIds.includes(t._id),
      );
      if (selectedTerms.length === 1) {
        const term = selectedTerms[0];
        return `${term.name} — ${term.yearName}`;
      }
      return `${selectedTerms.length} terms selected`;
    }

    return filterLabel;
  }, [mode, selectedYearIds, selectedTermIds, years, allTerms, filterLabel]);

  // Update the label in context whenever it changes
  React.useEffect(() => {
    setFilterLabel(displayLabel);
  }, [displayLabel, setFilterLabel]);

  // Group terms by year
  const termsByYear = React.useMemo(() => {
    if (!allTerms || !years) return new Map();
    const map = new Map<string, typeof allTerms>();
    for (const year of years) {
      const yearTerms = allTerms.filter((t) => t.yearId === year._id);
      map.set(year._id, yearTerms);
    }
    return map;
  }, [allTerms, years]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <HugeiconsIcon
                icon={SchoolIcon}
                strokeWidth={2}
                className="size-4"
              />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium truncate max-w-[140px]">
                {schoolName}
              </span>
              <span className="text-xs text-sidebar-foreground/60 truncate max-w-[140px]">
                {displayLabel}
              </span>
            </div>
            <HugeiconsIcon
              icon={UnfoldMoreIcon}
              strokeWidth={2}
              className="ml-auto"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            {/* All Time option */}
            <DropdownMenuItem onClick={selectAllTime}>
              <HugeiconsIcon
                icon={InfinityCircleIcon}
                strokeWidth={2}
                className="mr-2 size-4"
              />
              All Time
              {mode === "all-time" && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="ml-auto size-4"
                />
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Year groups with terms */}
            {years?.map((year) => {
              const yearTerms: NonNullable<typeof allTerms> =
                termsByYear.get(year._id) || [];
              const isYearSelected =
                mode === "years" && selectedYearIds.includes(year._id);

              if (yearTerms.length === 0) {
                // No terms — just show as a clickable item
                return (
                  <DropdownMenuItem
                    key={year._id}
                    onClick={() => selectYear(year._id)}
                  >
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      strokeWidth={2}
                      className="mr-2 size-4"
                    />
                    {year.name}
                    {isYearSelected && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        strokeWidth={2}
                        className="ml-auto size-4"
                      />
                    )}
                  </DropdownMenuItem>
                );
              }

              // Has terms — show as submenu
              return (
                <DropdownMenuSub key={year._id}>
                  <DropdownMenuSubTrigger>
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      strokeWidth={2}
                      className="mr-2 size-4"
                    />
                    {year.name}
                    {isYearSelected && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        strokeWidth={2}
                        className="ml-auto size-4 mr-2"
                      />
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {/* Select entire year */}
                    <DropdownMenuItem onClick={() => selectYear(year._id)}>
                      All of {year.name}
                      {isYearSelected && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          strokeWidth={2}
                          className="ml-auto size-4"
                        />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Individual terms */}
                    {yearTerms.map((term) => {
                      const isTermSelected =
                        mode === "terms" && selectedTermIds.includes(term._id);
                      return (
                        <DropdownMenuItem
                          key={term._id}
                          onClick={() => selectTerm(term._id)}
                        >
                          {term.name}
                          {isTermSelected && (
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              strokeWidth={2}
                              className="ml-auto size-4"
                            />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}

            {(!years || years.length === 0) && (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground text-xs">
                  No academic years configured
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
