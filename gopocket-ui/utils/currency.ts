export const formatCurrentyScale = (cents: number): number => cents / 100
export const formatCurrencyString = (cents: number): string => `$${formatCurrentyScale(cents).toFixed(2)}`;