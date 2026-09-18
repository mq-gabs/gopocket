import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CalendarDateAttributes = HTMLAttributes<HTMLElement> & {
  value?: string;
  min?: string;
  max?: string;
  months?: number;
  locale?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-date": DetailedHTMLProps<CalendarDateAttributes, HTMLElement>;
      "calendar-range": DetailedHTMLProps<CalendarDateAttributes, HTMLElement>;
      "calendar-month": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { offset?: number },
        HTMLElement
      >;
      "calendar-select-month": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "calendar-select-year": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
