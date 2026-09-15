"use client";

import { useState } from "react";

type TUseRequestParams<T> = {
  callback: () => Promise<T>;
};

type TUseRequestResult<T> = {
  call: () => void;
  result: T | null;
  error: string | null;
  loading: boolean;
};

export const useRequest = <T>(
  params: TUseRequestParams<T>,
): TUseRequestResult<T> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = () => {
    setLoading(true);
    setResult(null);
    setError(null);

    params
      .callback()
      .then((resp) => setResult(resp))
      .catch((err) => setError(String(err?.error || err)))
      .finally(() => setLoading(false));
  };

  return {
    call,
    loading,
    error,
    result,
  };
};
