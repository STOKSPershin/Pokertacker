import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { intervalToDuration } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeconds(seconds: number): string {
  if (seconds === 0) return '0с';

  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

  const totalHours = (duration.days || 0) * 24 + (duration.hours || 0);

  const parts = [];
  if (totalHours > 0) parts.push(`${totalHours}ч`);
  if (duration.minutes) parts.push(`${duration.minutes}м`);
  if (duration.seconds) parts.push(`${duration.seconds}с`);

  return parts.join(' ').trim();
}
