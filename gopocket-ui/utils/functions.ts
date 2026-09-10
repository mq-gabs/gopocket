export const doNothing = () => {};

type ThrottleParams = {
    timeoutMs: number
}
export const makeVoidThrottle = ({ timeoutMs }: ThrottleParams): (fn: () => void) => void => {
    let lastCallAt = 0

    return (fn: () => void) => {
        const now = new Date().getTime()

        const diff = now - lastCallAt
        lastCallAt = now

        if (diff < timeoutMs) {
            return
        }

        fn()
    }
}