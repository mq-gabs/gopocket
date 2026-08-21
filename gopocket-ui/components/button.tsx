export type ButtonVariation =
  | "primary"
  | "secondary"
  | "destructive"
  | "neutral"
  | "blank";

// map variation to classes
const mapVariationToClasses: Record<ButtonVariation, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  neutral: "bg-light-gray/50 text-foreground",
  blank: "hover:bg-light-gray",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variation?: ButtonVariation;
}

export function Button({
  children,
  onClick,
  variation = "primary",
  ...rest
}: ButtonProps) {
  const baseClasses =
    "text-sm hover:brightness-110 font-bold cursor-pointer px-3 py-1 rounded-lg  flex items-center justify-center gap-2";

  const { className: extraClasses, ...restProps } = rest;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${mapVariationToClasses[variation]} ${extraClasses}`}
      {...restProps}
    >
      {children}
    </button>
  );
}
