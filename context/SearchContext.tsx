"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type SearchContextValue = {
  searchLocation: string;
  setSearchLocation: (value: string) => void;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchLocation, setSearchLocation] = useState("");

  return (
    <SearchContext.Provider value={{ searchLocation, setSearchLocation }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}


