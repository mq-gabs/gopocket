import { KeyboardEventHandler } from "react";

export const makeOnKeyDown = <T extends HTMLElement>(
  key: string,
  callback: () => void,
): KeyboardEventHandler<T> => {
  return (event) => {
    console.log({ event })
    if (event.key === key) {
      callback();
    }
  };
};