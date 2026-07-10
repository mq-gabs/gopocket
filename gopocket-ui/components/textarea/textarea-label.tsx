import { TextareaHTMLAttributes } from "react";

interface TextareaLabelProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextareaLabel({
  label,
  id,
  className = "",
  ...props
}: TextareaLabelProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-base-content">
        {label}
      </label>

      <textarea
        id={id}
        className={`text-sm border border-light-gray px-3 py-1 w-full resize-none outline-primary rounded-lg ${className} `}
        {...props}
      />
    </div>
  );
}
