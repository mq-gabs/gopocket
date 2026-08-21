import { ComponentType, SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string | ComponentType;
}

interface SelectLabelProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

interface LabelProps  {
  label: SelectOption['label']
}

function Label({ label }: LabelProps) {
  if (typeof label === 'string') {
    return <span>{label}</span>
  }

  const Label = label

  return <Label />
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
        className={`text-sm border border-light-gray outline-primary px-3! py-1! rounded-lg w-full ${className} `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
           <Label label={option.label} />
          </option>
        ))}
      </select>
    </div>
  );
}
