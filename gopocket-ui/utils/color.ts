export const getForegroundContrastColor = (color: string): string => {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const luminance = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  const L = 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2];

  // White contrast = 1.05 / (L + 0.05)
  // Black contrast = (L + 0.05) / 0.05

  return 1.05 / (L + 0.05) > (L + 0.05) / 0.05
    ? "#ffffff"
    : "#000000";
}