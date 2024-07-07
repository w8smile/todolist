export type Action<T extends (...args: any) => any> = Omit<ReturnType<T>, 'meta'>;

export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    data: D
    fieldsErrors: FieldErrorType[]
}

export type FieldErrorType = {
    error: string
    field: string
}

