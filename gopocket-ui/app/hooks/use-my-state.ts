import { Dispatch,  SetStateAction,  useState } from "react";

type MyState<T> = {
    value: T;
    set: Dispatch<SetStateAction<T>>;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useMyState = <T>(initialValue: T): MyState<T> => {
    const [value, set] = useState<T>(initialValue);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        set(event.target.value as unknown as T);
    };

    return  {
        value,
        set,
        onChange,
    };
}