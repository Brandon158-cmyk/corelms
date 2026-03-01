"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Id } from "@/convex/_generated/dataModel";

export type TermFilterMode = "all-time" | "years" | "terms";

export interface TermFilterState {
  mode: TermFilterMode;
  selectedYearIds: Id<"academicYears">[];
  selectedTermIds: Id<"terms">[];
}

interface TermFilterContextValue extends TermFilterState {
  setFilter: (state: Partial<TermFilterState>) => void;
  selectAllTime: () => void;
  selectYear: (yearId: Id<"academicYears">) => void;
  selectTerm: (termId: Id<"terms">) => void;
  toggleYear: (yearId: Id<"academicYears">) => void;
  toggleTerm: (termId: Id<"terms">) => void;
  /** A readable label like "All Time", "2026", or "Term 1 - 2026" */
  filterLabel: string;
  setFilterLabel: (label: string) => void;
}

const STORAGE_KEY = "corelms_term_filter";

const DEFAULT_STATE: TermFilterState = {
  mode: "all-time",
  selectedYearIds: [],
  selectedTermIds: [],
};

const TermFilterContext = createContext<TermFilterContextValue | null>(null);

export function TermFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<TermFilterState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  const [filterLabel, setFilterLabel] = useState("All Time");

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const setFilter = useCallback((partial: Partial<TermFilterState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const selectAllTime = useCallback(() => {
    setState({ mode: "all-time", selectedYearIds: [], selectedTermIds: [] });
    setFilterLabel("All Time");
  }, []);

  const selectYear = useCallback((yearId: Id<"academicYears">) => {
    setState({ mode: "years", selectedYearIds: [yearId], selectedTermIds: [] });
  }, []);

  const selectTerm = useCallback((termId: Id<"terms">) => {
    setState({ mode: "terms", selectedYearIds: [], selectedTermIds: [termId] });
  }, []);

  const toggleYear = useCallback((yearId: Id<"academicYears">) => {
    setState((prev) => {
      const exists = prev.selectedYearIds.includes(yearId);
      const newYearIds = exists
        ? prev.selectedYearIds.filter((id) => id !== yearId)
        : [...prev.selectedYearIds, yearId];

      if (newYearIds.length === 0) {
        return { mode: "all-time", selectedYearIds: [], selectedTermIds: [] };
      }

      return {
        mode: "years",
        selectedYearIds: newYearIds,
        selectedTermIds: [],
      };
    });
  }, []);

  const toggleTerm = useCallback((termId: Id<"terms">) => {
    setState((prev) => {
      const exists = prev.selectedTermIds.includes(termId);
      const newTermIds = exists
        ? prev.selectedTermIds.filter((id) => id !== termId)
        : [...prev.selectedTermIds, termId];

      if (newTermIds.length === 0) {
        return { mode: "all-time", selectedYearIds: [], selectedTermIds: [] };
      }

      return {
        mode: "terms",
        selectedYearIds: [],
        selectedTermIds: newTermIds,
      };
    });
  }, []);

  return (
    <TermFilterContext.Provider
      value={{
        ...state,
        setFilter,
        selectAllTime,
        selectYear,
        selectTerm,
        toggleYear,
        toggleTerm,
        filterLabel,
        setFilterLabel,
      }}
    >
      {children}
    </TermFilterContext.Provider>
  );
}

export function useTermFilter() {
  const context = useContext(TermFilterContext);
  if (!context) {
    throw new Error("useTermFilter must be used within a TermFilterProvider");
  }
  return context;
}
