"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import CategoryBadge from "@/components/category-badge";
import { useI18n } from "@/contexts/i18n-context";
import type { Category } from "@/types/models";
import { cls } from "@/utils/cls";

interface CategoryMultiSelectProps {
  id?: string;
  label: string;
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export function CategoryMultiSelect({
  id,
  label,
  categories,
  selectedIds,
  onChange,
  error,
}: CategoryMultiSelectProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCategories = useMemo(
    () =>
      selectedIds
        .map((selectedId) =>
          categories.find((category) => category.id === selectedId),
        )
        .filter((category): category is Category => category !== undefined),
    [selectedIds, categories],
  );

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return categories
      .filter((category) => !selectedIds.includes(category.id))
      .filter((category) =>
        normalizedQuery
          ? category.name.toLowerCase().includes(normalizedQuery)
          : true,
      );
  }, [categories, selectedIds, query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideContainer = containerRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideContainer && !insideMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // The dropdown is portaled to document.body so it can escape the dialog's
  // `overflow-y: auto`/clipping and never gets cut off inside a scrolling
  // modal. Since it's no longer positioned via CSS relative to the input,
  // its position must be tracked manually against the viewport.
  useEffect(() => {
    if (!isOpen) return;

    const estimatedMenuHeight = 192; // matches the max-h-48 dropdown height

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward =
        spaceBelow < estimatedMenuHeight && rect.top > spaceBelow;
      setMenuPosition({
        top: openUpward ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
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

  const selectCategory = (categoryId: string) => {
    onChange([...selectedIds, categoryId]);
    setQuery("");
    setHighlightedIndex(0);

    // Nothing left to pick: close instead of leaving an empty dropdown open,
    // which would otherwise sit on top of (and swallow clicks meant for)
    // whatever is rendered below the field, such as a form's submit button.
    const remaining = options.filter((category) => category.id !== categoryId);
    if (remaining.length === 0) {
      setIsOpen(false);
      return;
    }

    inputRef.current?.focus();
  };

  const removeCategory = (categoryId: string) => {
    onChange(selectedIds.filter((value) => value !== categoryId));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option) selectCategory(option.id);
    } else if (
      event.key === "Backspace" &&
      query === "" &&
      selectedIds.length > 0
    ) {
      removeCategory(selectedIds[selectedIds.length - 1]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-medium text-base-content">
        {label}
      </label>

      <div className="relative" ref={anchorRef}>
        <div
          onClick={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
            inputRef.current?.focus();
          }}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-light-gray px-3 py-2 cursor-text"
        >
          {selectedCategories.map((category) => (
            <span key={category.id} className="flex items-center gap-1">
              <CategoryBadge category={category} />
              <button
                type="button"
                aria-label={`Remove ${category.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeCategory(category.id);
                }}
                className="cursor-pointer text-foreground/40 hover:text-destructive"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}

          <input
            id={id}
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => {
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCategories.length === 0
                ? t("categories.select.placeholder")
                : ""
            }
            autoComplete="off"
            className="min-w-[8ch] flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {isOpen && menuPosition
          ? createPortal(
              <ul
                ref={menuRef}
                style={{
                  position: "fixed",
                  left: menuPosition.left,
                  width: menuPosition.width,
                  ...(menuPosition.openUpward
                    ? { bottom: window.innerHeight - menuPosition.top + 4 }
                    : { top: menuPosition.top + 4 }),
                }}
                className="z-1000 max-h-48 overflow-auto rounded-lg border border-light-gray bg-background shadow-lg"
              >
                {options.length === 0 ? (
                  <li className="pointer-events-none px-3 py-2 text-sm text-foreground/60">
                    {t("categories.select.empty")}
                  </li>
                ) : (
                  options.map((category, index) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => selectCategory(category.id)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={cls(
                          "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm",
                          index === highlightedIndex ? "bg-primary-20" : "",
                        )}
                      >
                        <CategoryBadge category={category} />
                      </button>
                    </li>
                  ))
                )}
              </ul>,
              document.body,
            )
          : null}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
