export interface TourDisplaySettings {
  tour_price_suffix: string;
  tour_minimum_notice: string;
  tour_cancellation_policy: string;
}

export const defaultTourDisplaySettings: TourDisplaySettings = {
  tour_price_suffix: '/ person',
  tour_minimum_notice: 'Tour runs with a minimum of 6 guests.',
  tour_cancellation_policy:
    'Free cancellation up to 72 hours before the tour.\nCancellations made within 72 hours of the start time are non-refundable.\nPlease contact me as early as possible if your plans change.',
};

export function normalizeTourDisplaySettings(value: unknown): TourDisplaySettings {
  const raw = typeof value === 'object' && value !== null ? value as Partial<TourDisplaySettings> : {};

  return {
    tour_price_suffix:
      typeof raw.tour_price_suffix === 'string'
        ? raw.tour_price_suffix
        : defaultTourDisplaySettings.tour_price_suffix,
    tour_minimum_notice:
      typeof raw.tour_minimum_notice === 'string'
        ? raw.tour_minimum_notice
        : defaultTourDisplaySettings.tour_minimum_notice,
    tour_cancellation_policy:
      typeof raw.tour_cancellation_policy === 'string'
        ? raw.tour_cancellation_policy
        : defaultTourDisplaySettings.tour_cancellation_policy,
  };
}

export function splitPolicyLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}
