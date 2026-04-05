export interface TourAvailabilitySlot {
  date: string;
  booked_count: number;
  is_open: boolean;
}

export function normalizeAvailability(slots?: TourAvailabilitySlot[]) {
  if (!Array.isArray(slots)) return [];

  return slots
    .filter((slot): slot is TourAvailabilitySlot => Boolean(slot?.date))
    .map((slot) => ({
      date: slot.date,
      booked_count: Number.isFinite(slot.booked_count) ? Math.max(0, slot.booked_count) : 0,
      is_open: slot.is_open !== false,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startWeekday = firstDay.getUTCDay();
  const cells: Array<{ dateKey: string; day: number; inMonth: boolean }> = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - startWeekday;
    const date = new Date(Date.UTC(year, month, dayOffset + 1));
    cells.push({
      dateKey: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: dayOffset >= 0 && dayOffset < daysInMonth,
    });
  }

  return cells;
}

export function getMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 1)));
}

export function getInitialMonth(slots: TourAvailabilitySlot[]) {
  const firstFutureOrCurrent = slots.find((slot) => slot.date >= new Date().toISOString().slice(0, 10)) || slots[0];
  if (!firstFutureOrCurrent) {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  }

  return {
    year: Number.parseInt(firstFutureOrCurrent.date.slice(0, 4), 10),
    month: Number.parseInt(firstFutureOrCurrent.date.slice(5, 7), 10) - 1,
  };
}
