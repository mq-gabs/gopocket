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
        className={`input w-full border-0 bg-light-gray ${className}`}
        {...props}
      />
    </div>
  );
}
