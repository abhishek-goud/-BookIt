export function monthDayToISO(dateStr: string, defaultYear?: number): string {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date().toISOString().slice(0, 10);
  }
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length !== 2) {
    return new Date().toISOString().slice(0, 10);
  }
  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const month = months[parts[0]];
  if (!month) {
    return new Date().toISOString().slice(0, 10);
  }
  const dayNum = parseInt(parts[1], 10);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    return new Date().toISOString().slice(0, 10);
  }
  const day = String(dayNum).padStart(2, "0");
  const year = String(defaultYear ?? new Date().getFullYear());
  return `${year}-${month}-${day}`;
}


