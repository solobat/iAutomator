import * as Code from './code';

export default class Response {
    code: number;
    message: string;
    data: any;

    constructor(codeMsg: Code.CodeMsg) {
        this.code = codeMsg.code;
        this.message = codeMsg.msg;
    }

    static ok(data: any) {
        const instance = new Response(Code.OK);

        instance.data = data;

        return instance;
    }

    static error(codeMsg: Code.CodeMsg) {
        const instance = new Response(codeMsg);

        return instance;
    }
}