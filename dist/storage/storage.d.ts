interface ImplementInterface {
    namespace: string | undefined;
    setMethod(key: string, data: string): Promise<any>;
    getMethod(key: string): Promise<any>;
    removeMethod(key: string): Promise<any>;
}
declare class StorageService {
    namespace: string | undefined;
    setMethod: ((key: string, data: string) => any) | undefined;
    getMethod: ((key: string) => any) | undefined;
    removeMethod: ((key: string) => any) | undefined;
    constructor(namespace?: string);
    implement({ setMethod, getMethod, removeMethod, namespace }: ImplementInterface): void;
    _getKey(key: string): string;
    set(key: string, data: any): Promise<any>;
    get(key: string): Promise<any>;
    remove(key: string): Promise<any>;
}
declare const storage: StorageService;
export { storage };
