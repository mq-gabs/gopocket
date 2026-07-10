import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function InputLabel({
  label,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-base-content">
        {label}
      </label>

      <input
        id={id}
        className={`text-sm border border-light-gray outline-primary px-3 py-1 rounded-lg w-full ${className}`}
        {...props}
      />
    </div>
  );
}
