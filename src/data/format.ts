export function formatDuration(totalMinutes: number): { hours: number; minutes: number; spoken: string } {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const spoken = [hours && `${hours} hour${hours === 1 ? '' : 's'}`, minutes && `${minutes} minute${minutes === 1 ? '' : 's'}`]
    .filter(Boolean)
    .join(' ');
  return { hours, minutes, spoken };
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}
