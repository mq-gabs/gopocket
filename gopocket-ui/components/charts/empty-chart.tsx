import { useI18n } from "@/contexts/i18n-context";
import { cls } from "@/utils/cls";

interface IEmptyChart {
  className?: string;
}
export default function EmptyChart({ className = "" }: IEmptyChart) {
  const { t } = useI18n();
  return (
    <div
      className={cls(
        "w-full h-full flex items-center justify-center border border-foreground/10 rounded-xl",
        className,
      )}
    >
      <span className="text-foreground/80">{t("dashboard.emptyData")}</span>
    </div>
  );
}
