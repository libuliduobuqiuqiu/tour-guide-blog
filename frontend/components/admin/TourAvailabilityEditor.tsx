'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TourAvailabilitySlot, getInitialMonth, getMonthLabel, getMonthMatrix, getTodayDateKey, normalizeAvailability } from '@/lib/tour-availability';

interface TourAvailabilityEditorProps {
  value?: TourAvailabilitySlot[];
  onChange: (value: TourAvailabilitySlot[]) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TourAvailabilityEditor({ value, onChange }: TourAvailabilityEditorProps) {
  const slots = useMemo(() => normalizeAvailability(value), [value]);
  const slotMap = useMemo(() => new Map(slots.map((slot) => [slot.date, slot])), [slots]);
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [manualMonthState, setManualMonthState] = useState<{ year: number; month: number } | null>(null);

  const firstEditableSlot = slots.find((slot) => slot.date >= todayDateKey)?.date || '';
  const activeSelectedDate =
    selectedDate && slotMap.has(selectedDate) && selectedDate >= todayDateKey ? selectedDate : firstEditableSlot;
  const monthState = manualMonthState ?? getInitialMonth(slots);
  const selectedSlot = activeSelectedDate ? slotMap.get(activeSelectedDate) : undefined;
  const monthCells = useMemo(() => getMonthMatrix(monthState.year, monthState.month), [monthState]);

  const moveMonth = (direction: -1 | 1) => {
    setManualMonthState((currentState) => {
      const current = currentState ?? getInitialMonth(slots);
      const nextMonth = current.month + direction;
      if (nextMonth < 0) return { year: current.year - 1, month: 11 };
      if (nextMonth > 11) return { year: current.year + 1, month: 0 };
      return { year: current.year, month: nextMonth };
    });
  };

  const updateSlots = (nextSlots: TourAvailabilitySlot[]) => {
    onChange(normalizeAvailability(nextSlots));
  };

  const toggleDate = (date: string) => {
    const existing = slotMap.get(date);
    if (existing) {
      updateSlots(slots.filter((slot) => slot.date !== date));
      if (activeSelectedDate === date) setSelectedDate('');
      return;
    }

    updateSlots([...slots, { date, booked_count: 0, is_open: true }]);
    setSelectedDate(date);
  };

  return (
    <div className="rounded-[1.4rem] border border-slate-200/90 bg-white/80 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.2)] md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Availability Calendar</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Click a future date to open or close booking. Open dates are green. Closed dates and past dates stay grey.
          </p>
        </div>
        <div className="text-xs text-slate-500">Past dates are automatically unavailable.</div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.85fr)]">
        <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => moveMonth(-1)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-950">
              <ChevronLeft size={18} />
            </button>
            <div className="text-lg font-semibold text-slate-950">{getMonthLabel(monthState.year, monthState.month)}</div>
            <button type="button" onClick={() => moveMonth(1)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-950">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="py-2">{weekday}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthCells.map((cell) => {
              const slot = slotMap.get(cell.dateKey);
              const isPast = cell.dateKey < todayDateKey;
              const isOpen = !isPast && Boolean(slot?.is_open);
              const isSelected = activeSelectedDate === cell.dateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => {
                    if (isPast) return;
                    toggleDate(cell.dateKey);
                  }}
                  className={[
                    'min-h-14 rounded-2xl border text-sm transition',
                    cell.inMonth ? '' : 'opacity-35',
                    isOpen ? 'border-emerald-300 bg-emerald-100 text-slate-950 hover:bg-emerald-200' : 'border-slate-200 bg-white text-slate-400',
                    isSelected ? 'ring-2 ring-slate-950/15' : '',
                    isPast ? 'cursor-default opacity-60' : '',
                  ].join(' ')}
                  title={isOpen ? `${cell.dateKey}: open` : isPast ? `${cell.dateKey}: past date` : `${cell.dateKey}: closed`}
                >
                  <div className="font-medium">{cell.day}</div>
                  {isOpen && <div className="mt-1 text-[11px] font-medium text-emerald-700">Available</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-4">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Date Settings</div>
          {selectedSlot ? (
            <>
              <div className="mt-3 text-xl font-semibold text-slate-950">{selectedSlot.date}</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This date is currently open for booking.
              </p>
              <button
                type="button"
                onClick={() => toggleDate(selectedSlot.date)}
                className="mt-5 inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Close This Date
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Click any future date on the calendar to open it for booking. Open dates are shown in green.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
