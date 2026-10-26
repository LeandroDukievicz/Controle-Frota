const km1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const int = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** 47.3 → "47,3 km" */
export function formatKm(value: number, decimals = true) {
  return (decimals ? km1.format(value) : int.format(value)) + " km";
}

/** Milliseconds → "2h 14m" */
export function formatElapsed(ms: number) {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/** "Carolina Meneghetti" → "CM" */
export function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
}
