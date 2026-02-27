const STORAGE_KEY = "oscars2026_picks";
const CURRENT_STEP_KEY = "oscars2026_step";
const NAME_KEY = "oscars2026_name";

export type Picks = Record<string, string>; // { [categoryName]: pickKey }

export function loadPicks(): Picks {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function savePick(category: string, pickKey: string): void {
  const picks = loadPicks();
  picks[category] = pickKey;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
}

export function loadStep(): number {
  if (typeof window === "undefined") return 0;
  const val = parseInt(localStorage.getItem(CURRENT_STEP_KEY) ?? "0", 10);
  return isNaN(val) ? 0 : val;
}

export function saveStep(step: number): void {
  localStorage.setItem(CURRENT_STEP_KEY, String(step));
}

export function loadName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function saveName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}

export function clearBallot(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_STEP_KEY);
  localStorage.removeItem(NAME_KEY);
}
