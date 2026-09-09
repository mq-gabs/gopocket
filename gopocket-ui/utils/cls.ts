export const cls = (...classses: string[]): string => classses.join(" ");

export const clsx = (classes: Record<string, boolean>): string =>
  Object.entries(classes)
    .map(([className, active]) => (active ? className : null))
    .filter(Boolean)
    .join(" ");
