"use client";

import { useState } from "react";
import { HttpError } from "@/services/http-client";

type TUseRequestParams<T> = {
  callback: () => Promise<T>;
};

type TUseRequestResult<T> = {
  call: () => void;
  result: T | null;
  error: string | null;
  /** Backend error key for translation (see utils/api-error.ts); null when unavailable. */
  errorKey: string | null;
  loading: boolean;
};

export const useRequest = <T>(
  params: TUseRequestParams<T>,
): TUseRequestResult<T> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const call = () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setErrorKey(null);

    params
      .callback()
      .then((resp) => setResult(resp))
      .catch((err) => {
        setError(String(err?.error || err));
        setErrorKey(err instanceof HttpError ? (err.key ?? null) : null);
      })
      .finally(() => setLoading(false));
  };

  return {
    call,
    loading,
    error,
    errorKey,
    result,
  };
};
