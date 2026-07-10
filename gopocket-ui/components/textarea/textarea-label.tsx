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
        className={`textarea border-0 w-full ${className} resize-none bg-light-gray`}
        {...props}
      />
    </div>
  );
}
