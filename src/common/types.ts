export type Action<T extends (...args: any) => any> = Omit<ReturnType<T>, 'meta'>;