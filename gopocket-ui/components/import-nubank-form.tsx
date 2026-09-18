"use client";

import { useState } from "react";
import { ArrowPathIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import type { Category, ImportRule } from "@/types/models";
import { Button } from "./button";
import { CategoryMultiSelect } from "./category-multi-select";
import { InputLabel } from "./inputs/input-label";

interface RuleState {
  key: string;
  term: string;
  category_ids: string[];
}

interface ImportNubankFormProps {
  categories: Category[];
  onSubmit: (
    file: File,
    generalCategoryIds: string[],
    rules: ImportRule[],
  ) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const newRule = (): RuleState => ({
  key: crypto.randomUUID(),
  term: "",
  category_ids: [],
});

export function ImportNubankForm({
  categories,
  onSubmit,
  onCancel,
  submitLabel,
}: ImportNubankFormProps) {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [generalCategoryIds, setGeneralCategoryIds] = useState<string[]>([]);
  const [rules, setRules] = useState<RuleState[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addRule = () => setRules((prev) => [...prev, newRule()]);

  const removeRule = (key: string) =>
    setRules((prev) => prev.filter((rule) => rule.key !== key));

  const updateRuleTerm = (key: string, term: string) =>
    setRules((prev) =>
      prev.map((rule) => (rule.key === key ? { ...rule, term } : rule)),
    );

  const updateRuleCategories = (key: string, category_ids: string[]) =>
    setRules((prev) =>
      prev.map((rule) => (rule.key === key ? { ...rule, category_ids } : rule)),
    );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setFileError(t("common.required"));
      return;
    }
    setFileError(null);

    setSubmitting(true);
    try {
      await onSubmit(
        file,
        generalCategoryIds,
        rules
          .filter((rule) => rule.term.trim() !== "")
          .map(({ term, category_ids }) => ({ term, category_ids })),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-base-content">
          {t("transactions.import.nubank.file")}
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="file-input file-input-bordered w-full text-sm"
        />
        {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      </div>

      <CategoryMultiSelect
        id="import-general-category"
        label={t("transactions.import.nubank.generalCategories")}
        categories={categories}
        selectedIds={generalCategoryIds}
        onChange={setGeneralCategoryIds}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-base-content">
            {t("transactions.import.nubank.rules")}
          </span>
          <Button type="button" variation="neutral" onClick={addRule}>
            <PlusIcon className="h-4 w-4" />
            {t("transactions.import.nubank.addRule")}
          </Button>
        </div>

        {rules.map((rule) => (
          <div
            key={rule.key}
            className="flex items-end gap-2 rounded-lg border border-light-gray p-3"
          >
            <div className="flex-1">
              <InputLabel
                id={`rule-term-${rule.key}`}
                label={t("transactions.import.nubank.term")}
                value={rule.term}
                onChange={(event) => updateRuleTerm(rule.key, event.target.value)}
              />
            </div>
            <div className="flex-1">
              <CategoryMultiSelect
                id={`rule-category-${rule.key}`}
                label={t("transactions.form.category")}
                categories={categories}
                selectedIds={rule.category_ids}
                onChange={(ids) => updateRuleCategories(rule.key, ids)}
              />
            </div>
            <Button
              type="button"
              variation="blank"
              onClick={() => removeRule(rule.key)}
              className="p-1!"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variation="neutral" onClick={onCancel}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              {t("actions.importing")}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
