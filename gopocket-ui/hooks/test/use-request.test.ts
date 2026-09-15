import { renderHook, act, waitFor } from "@testing-library/react";
import { useRequest } from "../use-request";

describe("useRequest", () => {
  it("should start with the correct initial state", () => {
    const callback = jest.fn();

    const { result } = renderHook(() => useRequest({ callback }));

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should set loading while the request is running", async () => {
    let resolve: (value: string) => void;

    const callback = jest.fn(
      () =>
        new Promise<string>((res) => {
          resolve = res;
        }),
    );

    const { result } = renderHook(() => useRequest({ callback }));

    act(() => {
      result.current.call();
    });

    expect(result.current.loading).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve!("success");
    });

    expect(result.current.loading).toBe(false);
  });

  it("should store the callback result", async () => {
    const callback = jest.fn().mockResolvedValue("success");

    const { result } = renderHook(() => useRequest({ callback }));

    act(() => {
      result.current.call();
    });

    await waitFor(() => {
      expect(result.current.result).toBe("success");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should store the error when the callback fails", async () => {
    const callback = jest.fn().mockRejectedValue({
      error: "Something went wrong",
    });

    const { result } = renderHook(() => useRequest({ callback }));

    act(() => {
      result.current.call();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Something went wrong");
    });

    expect(result.current.loading).toBe(false);
  });

  it("should convert a rejected error to a string", async () => {
    const callback = jest.fn().mockRejectedValue("Request failed");

    const { result } = renderHook(() => useRequest({ callback }));

    act(() => {
      result.current.call();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Request failed");
    });

    expect(result.current.loading).toBe(false);
  });

  it("should call the callback every time call is invoked", async () => {
    const callback = jest.fn().mockResolvedValue("success");

    const { result } = renderHook(() => useRequest({ callback }));

    act(() => {
      result.current.call();
      result.current.call();
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
