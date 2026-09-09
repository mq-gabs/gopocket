export type ButtonVariation =
  | "primary"
  | "secondary"
  | "destructive"
  | "neutral"
  | "blank";

const mapVariationToClasses: Record<ButtonVariation, string> = {
  primary: "bg-primary-20 text-primary border border-primary" ,
  secondary: "bg-secondary-60 text-secondary-foreground border border-secondary",
  destructive: "bg-destructive/20 text-destructive border border-destructive",
  neutral: "bg-light-gray/50 text-foreground border bordr-light-gray",
  blank: "hover:bg-light-gray/50 border border-transparent hover:border-light-gray",
};
const getClassByVariation = (variation: ButtonVariation): string => mapVariationToClasses[variation] || mapVariationToClasses['primary']


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
      className={`${baseClasses} ${getClassByVariation(variation)} ${extraClasses}`}
      {...restProps}
    >
      {children}
    </button>
  );
}
