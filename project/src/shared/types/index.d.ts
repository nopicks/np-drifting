declare const AsyncExports: any 

declare class RPC {
    static register(name: string, cb: (source: number, ...args: any) => any): void ;
    static execute(name: string, ...args: any): any;
}

declare class NPX {
    static getModule(name: any): any;
}