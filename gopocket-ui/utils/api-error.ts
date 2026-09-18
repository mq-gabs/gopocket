import type { TranslateFunction } from "@/contexts/i18n-context";
import type { TranslationKey } from "@/locales";
import { HttpError } from "@/services/http-client";

// Maps a backend error `key` (see internal/http/response.go and each
// endpoint's WriteError calls) to the translation key to show instead of the
// raw, untranslated `error` string the API also sends.
const ERROR_KEY_MESSAGES: Record<string, TranslationKey> = {
  invalid_request_body: "errors.invalidRequestBody",
  validation_failed: "errors.validationFailed",
  internal_error: "errors.internalError",
  category_not_found: "errors.categoryNotFound",
  transaction_not_found: "errors.transactionNotFound",
  transactions_not_found: "errors.transactionsNotFound",
  csv_file_required: "errors.csvFileRequired",
  csv_file_unreadable: "errors.csvFileUnreadable",
  invalid_csv: "errors.invalidCsv",
};

/**
 * Translates a backend error key, falling back to a generic translated
 * message (never the raw API string) when the key is missing or unmapped.
 */
export function translateErrorKey(
  key: string | null | undefined,
  t: TranslateFunction,
): string {
  if (key && key in ERROR_KEY_MESSAGES) {
    return t(ERROR_KEY_MESSAGES[key]);
  }
  return t("common.error");
}

/** Same as translateErrorKey, but for a caught (thrown) value directly. */
export function getErrorMessage(err: unknown, t: TranslateFunction): string {
  return translateErrorKey(err instanceof HttpError ? err.key : undefined, t);
}
