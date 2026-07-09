import { useI18n } from "@/contexts/i18n-context";

export function Logo() {
    const { t } = useI18n();

    return (
        <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("app.title")}</p>
    )
}