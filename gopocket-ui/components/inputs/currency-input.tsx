"use client";

import { doNothing } from "@/utils/functions";
import {
  ClipboardEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  useEffect,
  useState,
} from "react";

interface CurrencyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  label: string;
  value?: number;
  onChange?: (value: number) => void;
}

function formatIntegerWithSeparators(value: number, separator: string) {
  const stringValue = value.toString();
  if (stringValue.length <= 3) {
    return stringValue;
  }

  const parts: string[] = [];
  let remainder = stringValue;

  while (remainder.length > 3) {
    parts.unshift(remainder.slice(-3));
    remainder = remainder.slice(0, -3);
  }

  parts.unshift(remainder);

  return parts.join(separator);
}

const PREFIX = '$'
const THOUSAND_SEPARATOR = ","
const DECIMAL_SEPARATOR = "."

function formatCurrencyValue(value: number) {
  const safeValue = Math.max(0, Math.floor(value));
  const integerPart = Math.floor(safeValue / 100);
  const decimalPart = safeValue % 100;

  return `${PREFIX}${formatIntegerWithSeparators(integerPart, THOUSAND_SEPARATOR)}${DECIMAL_SEPARATOR}${decimalPart.toString().padStart(2, "0")}`;
}

export function CurrencyInput({
  label,
  id,
  className = "",
  value = 0,
  onChange,
  ...props
}: CurrencyInputProps) {
  const [rawValue, setRawValue] = useState(Math.max(0, Math.floor(value)));
  const [digits, setDigits] = useState(String(Math.max(0, Math.floor(value))));

  useEffect(() => {
    const nextValue = Math.max(0, Math.floor(value));
    setRawValue(nextValue);
    setDigits(String(nextValue));
  }, [value]);

  const commitValue = (nextDigits: string) => {
    const normalizedDigits = nextDigits.replace(/\D/g, "");
    const normalizedValue = Number(normalizedDigits || "0");

    setDigits(normalizedDigits || "0");
    setRawValue(normalizedValue);
    onChange?.(normalizedValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isNavigationKey = [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(event.key);

    if (isNavigationKey) {
      if (event.key === "Backspace") {
        event.preventDefault();
        commitValue(digits.slice(0, -1));
      }
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      commitValue(`${digits}${event.key}`);
      return;
    }

    event.preventDefault();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedValue = event.clipboardData.getData("text");
    const digitsFromPaste = pastedValue.replace(/\D/g, "");

    if (!digitsFromPaste) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    commitValue(`${digits}${digitsFromPaste}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-base-content">
        {label}
      </label>

      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={`text-sm border border-light-gray w-full outline-primary rounded-lg px-3 py-1 ${className}`}
        value={formatCurrencyValue(rawValue)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={doNothing}
        {...props}
      />
    </div>
  );
}
