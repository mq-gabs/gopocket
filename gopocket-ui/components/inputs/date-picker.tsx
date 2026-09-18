"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";

type CalendarElement = HTMLElement & { value: string };

// cally's `locale` prop feeds Intl.DateTimeFormat directly, which wants a
// proper BCP-47 tag ("pt-BR"), not this app's lowercase locale key.
const CALLY_LOCALES: Record<string, string> = {
  en: "en-US",
  "pt-br": "pt-BR",
};

interface DatePickerProps {
  id?: string;
  label?: string;
  /** Falls back to the displayed value when omitted. */
  ariaLabel?: string;
  /** "YYYY-MM-DD" for granularity "day" (default), "YYYY-MM" for "month". */
  value: string;
  onChange: (value: string) => void;
  granularity?: "day" | "month";
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  id,
  label,
  ariaLabel,
  value,
  onChange,
  granularity = "day",
  min,
  max,
  required,
  disabled,
  className = "",
}: DatePickerProps) {
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number | null;
    right: number | null;
    openUpward: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // "cally" touches `document` at module-evaluation time, which breaks SSR
  // if imported statically — load it lazily, client-side only. Already-open
  // <calendar-date> elements auto-upgrade once the custom element is
  // defined, so no need to delay rendering the popover for this.
  useEffect(() => {
    import("cally");
  }, []);
  const calendarRef = useRef<CalendarElement | null>(null);

  // calendar-date always works with a full day; a "month" picker just
  // anchors on the first of that month and discards the day part again once
  // the user clicks one.
  const calendarValue =
    granularity === "month" && value ? `${value}-01` : value;

  // Read inside the native "change" listener without needing it in a
  // dependency array (see the callback ref below for why that matters here).
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const granularityRef = useRef(granularity);
  useEffect(() => {
    granularityRef.current = granularity;
  }, [granularity]);

  const handleCalendarChange = useCallback((event: Event) => {
    const nextValue = (event.target as CalendarElement).value;
    onChangeRef.current(
      granularityRef.current === "month" ? nextValue.slice(0, 7) : nextValue,
    );
    setIsOpen(false);
  }, []);

  // A plain useEffect keyed on `isOpen` won't do here: the calendar only
  // gets portaled into the DOM once `menuPosition` resolves (one render
  // after `isOpen` flips true), and `menuPosition` isn't one of that
  // effect's dependencies — so it would never re-run once the ref is
  // actually populated, and the listener would never get attached. A
  // callback ref sidesteps that entirely: React invokes it exactly when the
  // node mounts/unmounts, regardless of which state update caused it.
  const setCalendarRef = useCallback(
    (el: CalendarElement | null) => {
      calendarRef.current?.removeEventListener("change", handleCalendarChange);
      calendarRef.current = el;
      el?.addEventListener("change", handleCalendarChange);
    },
    [handleCalendarChange],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Portaled to document.body for the same reason as CategoryMultiSelect:
  // it must escape a modal's `overflow-y: auto` clipping, so its position is
  // tracked manually against the viewport instead of via CSS.
  useEffect(() => {
    if (!isOpen) return;

    const estimatedMenuHeight = 300;
    const estimatedMenuWidth = 300;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward =
        spaceBelow < estimatedMenuHeight && rect.top > spaceBelow;

      // The calendar is wider than most anchors, so (unlike the up/down
      // check being about the *anchor's* size) it can overflow the right
      // edge even when there's room below — fall back to right-aligning
      // against the anchor instead of always left-aligning to it.
      const spaceRight = window.innerWidth - rect.left;
      const openLeft =
        spaceRight < estimatedMenuWidth && rect.right > estimatedMenuWidth;

      setMenuPosition({
        top: openUpward ? rect.top : rect.bottom,
        left: openLeft ? null : rect.left,
        right: openLeft ? window.innerWidth - rect.right : null,
        openUpward,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const dateFnsLocale = locale === "pt-br" ? { locale: ptBR } : undefined;
  const displayValue = value
    ? format(
        parseISO(calendarValue),
        granularity === "month" ? "MMM yyyy" : "dd/MM/yyyy",
        dateFnsLocale,
      )
    : "";

  return (
    <div className={`flex flex-col gap-2  ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-base-content">
          {label}
        </label>
      )}

      <button
        id={id}
        ref={anchorRef}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-light-gray px-3 py-1 text-left text-sm outline-primary disabled:opacity-50 cursor-pointer"
      >
        <span className={displayValue ? "" : "text-foreground/40"}>
          {displayValue || "—"}
        </span>
        <CalendarDaysIcon className="h-4 w-4 shrink-0 text-foreground/50" />
      </button>

      {required && (
        // A plain button doesn't participate in native form validation the
        // way the <input type="date"> it replaced did. This mirrors the
        // value into a visually-hidden (but still validity-checked — unlike
        // display:none) input so a required, empty picker still blocks
        // submit like before.
        <input
          type="text"
          required
          value={value}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
      )}

      {isOpen && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                ...(menuPosition.left !== null
                  ? { left: menuPosition.left }
                  : { right: menuPosition.right ?? 0 }),
                ...(menuPosition.openUpward
                  ? { bottom: window.innerHeight - menuPosition.top + 4 }
                  : { top: menuPosition.top + 4 }),
              }}
              className="z-1000 rounded-lg border border-light-gray bg-background p-2 shadow-lg"
            >
              <calendar-date
                ref={setCalendarRef}
                className="cally"
                value={calendarValue}
                min={min}
                max={max}
                locale={CALLY_LOCALES[locale] ?? locale}
              >
                <ChevronLeftIcon slot="previous" className="h-4 w-4" />
                <ChevronRightIcon slot="next" className="h-4 w-4" />
                <calendar-month></calendar-month>
              </calendar-date>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
