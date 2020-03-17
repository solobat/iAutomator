
export interface CodeMsg {
    code: number;
    msg: string;
}

export const OK: CodeMsg = {
    code: 0,
    msg: 'ok'
};
export const BAD_REQUEST = {
    code: 400,
    msg: 'bad request'
};
export const PARAMS_ERROR = {
    code: 101,
    msg: 'params error'
};
export const EXISTS = {
    code: 102,
    msg: 'record exists'
};

export const NOT_EXISTS = {
    code: 103,
    msg: 'record not exists'
}