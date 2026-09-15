"use client";

import { ReactNode } from "react";

export type TableCellValue = string | number | ReactNode;

export interface TableColumn<T> {
  /** Unique key, should match a property in the row data (or be virtual) */
  key: keyof T | string;
  /** Column header label */
  header: string;
  /** Optional custom renderer; if omitted, falls back to row[key] */
  render?: (row: T, rowIndex: number) => TableCellValue;
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

  const renderCell = (
    col: TableColumn<T>,
    row: T,
    rowIndex: number,
  ): TableCellValue => {
    if (col.render) return col.render(row, rowIndex);
    const value = (row as Record<string, unknown>)[col.key as string];
    return value as TableCellValue;
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className={tableClasses}>
        <thead>
          <tr>
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
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-base-content/60"
              >
                {emptyState ?? "No data available"}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
              return (
                <tr
                  key={key}
                  onClick={
                    onRowClick ? () => onRowClick(row, rowIndex) : undefined
                  }
                  className={onRowClick ? "hover cursor-pointer" : ""}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`${alignClass(col.align)} ${col.className ?? ""}`}
                    >
                      {renderCell(col, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
