import type { AppState } from "./store";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Revenue (paid bookings + visa fees) and booking counts per month of 2026, up to the current month. */
export function monthlySeries(s: AppState, months = 10) {
  const out = MONTHS.slice(0, months).map((m) => ({ label: m, tours: 0, visa: 0, revenue: 0, bookings: 0, cancelled: 0, newCustomers: 0 }));
  for (const b of s.bookings) {
    const d = new Date(b.createdAt);
    if (d.getFullYear() !== 2026 || d.getMonth() >= months) continue;
    const row = out[d.getMonth()];
    row.bookings++;
    if (b.status === "Cancelled") row.cancelled++;
    if (b.paymentStatus === "Paid") row.tours += b.total;
  }
  for (const v of s.visaApplications) {
    const d = new Date(v.submittedAt);
    if (d.getFullYear() !== 2026 || d.getMonth() >= months) continue;
    out[d.getMonth()].visa += v.fee;
  }
  for (const c of s.customers) {
    const d = new Date(c.joinedAt);
    if (d.getFullYear() === 2026 && d.getMonth() < months) out[d.getMonth()].newCustomers++;
  }
  // Seed baseline so the demo reads like a year of trading, not just the sampled records.
  const base = [18400, 21200, 26800, 24100, 29500, 34800, 41200, 38600, 33900, 27400];
  const baseVisa = [3900, 4300, 5200, 4800, 5600, 6900, 7400, 7100, 6200, 2800];
  const baseBookings = [42, 48, 61, 55, 66, 79, 92, 88, 74, 31];
  return out.map((r, i) => {
    const tours = r.tours + (base[i] ?? 0);
    const visa = r.visa + (baseVisa[i] ?? 0);
    return { ...r, tours, visa, revenue: tours + visa, bookings: r.bookings + (baseBookings[i] ?? 0) };
  });
}

export function weeklyRevenue() {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({ label, revenue: [4200, 3800, 5100, 4700, 6900, 8200, 5600][i] }));
}

export function dailyRevenue() {
  return Array.from({ length: 30 }, (_, i) => ({ label: `${i + 1}`, revenue: Math.round(900 + 600 * Math.sin(i / 3) + ((i * 37) % 11) * 90) }));
}

export function yearlyRevenue() {
  return [
    { label: "2022", revenue: 182000 },
    { label: "2023", revenue: 241000 },
    { label: "2024", revenue: 298000 },
    { label: "2025", revenue: 336000 },
    { label: "2026", revenue: 362000 },
  ];
}

export function destinationPerformance(s: AppState) {
  const map = new Map<string, { name: string; bookings: number; revenue: number }>();
  for (const b of s.bookings) {
    const t = s.tours.find((x) => x.id === b.tourId);
    const d = s.destinations.find((x) => x.id === t?.destinationId);
    if (!d) continue;
    const row = map.get(d.id) ?? { name: d.name, bookings: 0, revenue: 0 };
    row.bookings++;
    if (b.paymentStatus === "Paid") row.revenue += b.total;
    map.set(d.id, row);
  }
  return [...map.values()].sort((a, b) => b.bookings - a.bookings);
}

export function tourPerformance(s: AppState) {
  return s.tours
    .map((t) => {
      const bs = s.bookings.filter((b) => b.tourId === t.id);
      return { id: t.id, name: t.title, bookings: t.bookings, revenue: bs.filter((b) => b.paymentStatus === "Paid").reduce((x, b) => x + b.total, 0), rating: t.rating };
    })
    .sort((a, b) => b.bookings - a.bookings);
}

export function visaStatusCounts(s: AppState) {
  const order = ["Submitted", "Under Review", "Documents Required", "Processing", "Approved", "Rejected", "Completed"] as const;
  return order.map((status) => ({ status, count: s.visaApplications.filter((v) => v.status === status).length }));
}
