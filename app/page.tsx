"use client";
import ExperienceCard from "@/components/ExperienceCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearch } from "@/context/SearchContext";
import { useDebounce } from "@/hooks/useDebounce";

export default function Home() {
  const router = useRouter();
  const { searchLocation } = useSearch();
  const debouncedSearch = useDebounce(searchLocation, 400);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const qs = debouncedSearch ? `?location=${encodeURIComponent(debouncedSearch)}` : "";
        console.log("debouncedSearch", debouncedSearch)
        const res = await fetch(`/api/experiences${qs}`, { signal: controller.signal });
        const data = await res.json();
        console.log({data})
        setItems(Array.isArray(data) ? data : []);
      } catch (_) {
        // ignore aborted or network errors for now
      }
    };
    run();
    return () => controller.abort();
  }, [debouncedSearch]);
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((experience) => (
          <ExperienceCard
            key={experience._id}
            id={experience._id}
            image={experience.image}
            title={experience.title}
            location={experience.location}
            description={experience.description}
            price={experience.price}
            onClick={() => router.push(`${experience._id}/details`)}
          />
        ))}
      </div>
    </main>
  );
}
