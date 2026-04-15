'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TourAvailabilitySlot, getInitialMonth, getMonthLabel, getMonthMatrix, normalizeAvailability } from '@/lib/tour-availability';

interface TourAvailabilityButtonProps {
  availability?: TourAvailabilitySlot[];
  maxBookings: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MINIMUM_GUESTS = 6;

export default function TourAvailabilityButton({ availability, maxBookings }: TourAvailabilityButtonProps) {
  const slots = useMemo(() => normalizeAvailability(availability), [availability]);
  const [open, setOpen] = useState(false);
  const [monthState, setMonthState] = useState(() => getInitialMonth(slots));
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMonthState(getInitialMonth(slots));
  }, [slots]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const slotMap = useMemo(() => new Map(slots.map((slot) => [slot.date, slot])), [slots]);
  const monthCells = useMemo(() => getMonthMatrix(monthState.year, monthState.month), [monthState]);

  const moveMonth = (direction: -1 | 1) => {
    setMonthState((current) => {
      const nextMonth = current.month + direction;
      if (nextMonth < 0) return { year: current.year - 1, month: 11 };
      if (nextMonth > 11) return { year: current.year + 1, month: 0 };
      return { year: current.year, month: nextMonth };
    });
  };

  return (
    <div ref={rootRef} className="relative mt-4">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_18px_38px_-24px_rgba(22,163,74,0.42)] transition hover:bg-emerald-300 md:text-base"
      >
        <CalendarDays size={18} />
        check availability
      </button>

      {open && (
        <div className="scale-in absolute left-0 top-[calc(100%+1rem)] z-[130] w-[min(92vw,48rem)] rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_34px_90px_-40px_rgba(15,23,42,0.38)] md:p-7 lg:left-auto lg:right-0">
          <div
            className="absolute -top-2 left-10 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white lg:left-auto lg:right-10"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Availability</div>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">Choose an open date</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Hover on an open date to see booked guests.
                </p>
                {maxBookings > 0 && <p className="mt-1 text-xs text-slate-500">Max {maxBookings} guests per date</p>}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-950">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={() => moveMonth(-1)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-950">
                  <ChevronLeft size={18} />
                </button>
                <div className="text-lg font-semibold text-slate-950">{getMonthLabel(monthState.year, monthState.month)}</div>
                <button type="button" onClick={() => moveMonth(1)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-950">
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {WEEKDAYS.map((weekday) => (
                  <div key={weekday} className="py-2">{weekday}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {monthCells.map((cell) => {
                  const slot = slotMap.get(cell.dateKey);
                  const isOpen = Boolean(slot?.is_open);
                  const bookedCount = slot?.booked_count ?? 0;
                  const isFull = isOpen && maxBookings > 0 && bookedCount >= maxBookings;
                  const isWarm = isOpen && !isFull && bookedCount >= MINIMUM_GUESTS;
                  const title = isOpen
                    ? `${cell.dateKey}: ${bookedCount}${maxBookings > 0 ? `/${maxBookings}` : ''} booked`
                    : `${cell.dateKey}: closed`;

                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      title={title}
                      aria-disabled={!isOpen || isFull}
                      className={[
                        'min-h-14 rounded-2xl border text-sm transition',
                        cell.inMonth ? '' : 'opacity-35',
                        isOpen && !isFull && !isWarm ? 'border-emerald-300 bg-emerald-100 text-slate-950 hover:bg-emerald-200' : '',
                        isWarm ? 'border-amber-300 bg-amber-100 text-slate-950 hover:bg-amber-200' : '',
                        isFull ? 'cursor-not-allowed border-slate-300 bg-slate-300 text-slate-600' : '',
                        !isOpen ? 'cursor-default border-slate-200 bg-white text-slate-400' : '',
                      ].join(' ')}
                    >
                      <div className="font-medium">{cell.day}</div>
                      {isOpen && (
                        <div className="mt-1 text-[11px] text-slate-600">
                          {bookedCount}
                          {maxBookings > 0 ? `/${maxBookings}` : ''} booked
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {slots.length === 0 && <p className="mt-5 text-sm text-slate-500">No open dates configured yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
