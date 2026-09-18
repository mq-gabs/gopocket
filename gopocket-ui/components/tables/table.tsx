"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { BulkAction, BulkActionsBar } from "./bulk-actions-bar";
import { Skeleton } from "../skeleton";

export type TableCellValue = string | number | ReactNode;

export interface TableColumn<T> {
  /** Unique key, should match a property in the row data (or be virtual) */
  key: keyof T | string;
  /** Column header label */
  header: string;
  /** Optional custom renderer; if omitted, falls back to row[key]. isRowHovered reflects whether the pointer is currently over this row. */
  render?: (row: T, rowIndex: number, isRowHovered: boolean) => TableCellValue;
  /** Optional className for the <th>/<td> */
  className?: string;
  /** Optional alignment */
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** DaisyUI table modifiers */
  size?: "xs" | "sm" | "md" | "lg";
  zebra?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
  className?: string;
  /** Optional row key extractor (defaults to index) */
  getRowKey?: (row: T, index: number) => string | number;
  /** Optional empty state content */
  emptyState?: ReactNode;
  /** Optional row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Renders a leading checkbox column for selecting rows, plus a "select all" checkbox in the header */
  selectable?: boolean;
  /** Keys (from getRowKey) of the currently selected rows */
  selectedKeys?: Set<string | number>;
  /** Called with the full updated selection whenever it changes */
  onSelectionChange?: (keys: Set<string | number>) => void;
  /** Actions shown in a floating bar while rows are selected (requires selectable) */
  bulkActions?: BulkAction[];
  /** Renders skeleton rows instead of data while a fetch is in flight */
  loading?: boolean;
  /** Number of skeleton rows to render while loading (default 5) */
  skeletonRowCount?: number;
}

const alignClass = (align?: "left" | "center" | "right") => {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
};

const sizeClass = (size?: TableProps<unknown>["size"]) => {
  switch (size) {
    case "xs":
      return "table-xs";
    case "sm":
      return "table-sm";
    case "lg":
      return "table-lg";
    case "md":
    default:
      return "table-md";
  }
};

export default function Table<T>({
  columns,
  data,
  size = "md",
  zebra = false,
  pinRows = false,
  pinCols = false,
  className = "",
  getRowKey,
  emptyState,
  onRowClick,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  bulkActions,
  loading = false,
  skeletonRowCount = 10,
}: TableProps<T>) {
  const tableClasses = [
    "table",
    sizeClass(size),
    zebra ? "table-zebra" : "",
    pinRows ? "table-pin-rows" : "",
    pinCols ? "table-pin-cols" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const [hoveredRowKey, setHoveredRowKey] = useState<string | number | null>(
    null,
  );

  const rowKeys = data.map((row, rowIndex) =>
    getRowKey ? getRowKey(row, rowIndex) : rowIndex,
  );
  const selectedCount = selectedKeys
    ? rowKeys.filter((key) => selectedKeys.has(key)).length
    : 0;
  const allSelected = rowKeys.length > 0 && selectedCount === rowKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleRow = (key: string | number) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(rowKeys));
  };

  const renderCell = (
    col: TableColumn<T>,
    row: T,
    rowIndex: number,
    isRowHovered: boolean,
  ): TableCellValue => {
    if (col.render) return col.render(row, rowIndex, isRowHovered);
    const value = (row as Record<string, unknown>)[col.key as string];
    return value as TableCellValue;
  };

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className={tableClasses}>
          <thead>
            <tr>
              {selectable ? (
                <th className="w-10">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              ) : null}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`${alignClass(col.align)} ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {selectable ? (
                    <td>
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={String(col.key)} className={alignClass(col.align)}>
                      <Skeleton className="h-4 w-full max-w-32 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-6 text-base-content/60"
                >
                  {emptyState ?? "No data available"}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
                const isRowHovered = hoveredRowKey === key;
                return (
                  <tr
                    key={key}
                    onClick={
                      onRowClick ? () => onRowClick(row, rowIndex) : undefined
                    }
                    onMouseEnter={() => setHoveredRowKey(key)}
                    onMouseLeave={() => setHoveredRowKey(null)}
                    className={
                      onRowClick
                        ? "hover cursor-pointer"
                        : "hover:bg-foreground/5"
                    }
                  >
                    {selectable ? (
                      <td
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedKeys?.has(key) ?? false}
                          onChange={() => toggleRow(key)}
                          aria-label="Select row"
                        />
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={`relative ${alignClass(col.align)} ${col.className ?? ""}`}
                      >
                        {renderCell(col, row, rowIndex, isRowHovered)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {selectable && bulkActions && bulkActions.length > 0 ? (
        <BulkActionsBar
          count={selectedCount}
          actions={bulkActions}
          onClear={() => onSelectionChange?.(new Set())}
        />
      ) : null}
    </>
  );
}
