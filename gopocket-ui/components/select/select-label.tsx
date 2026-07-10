import { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectLabelProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

export function SelectLabel({
  label,
  id,
  options,
  className = "",
  ...props
}: SelectLabelProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-base-content">
        {label}
      </label>

      <select
        id={id}
        className={`select border-0 w-full ${className} bg-light-gray`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
