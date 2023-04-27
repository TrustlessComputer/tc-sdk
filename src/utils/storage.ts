import { Validator } from "../utils";

interface ImplementInterface {
    namespace: string | undefined;
    setMethod(key: string, data: string) : Promise<any>;
    getMethod(key: string) : Promise<any>;
    removeMethod(key: string) : Promise<any>
}

class StorageService {
    namespace: string | undefined;
    setMethod: ((key: string, data: string) => any) | undefined;
    getMethod: ((key: string) => any) | undefined;
    removeMethod: ((key: string) => any) | undefined;

    constructor(namespace?: string) {
        this.namespace = namespace;
        this.setMethod = undefined;
        this.getMethod = undefined;
        this.removeMethod = undefined;
    }

    implement({ setMethod, getMethod, removeMethod, namespace } : ImplementInterface) {
        new Validator("setMethod", setMethod).required();
        new Validator("getMethod", getMethod).required();
        new Validator("removeMethod", removeMethod).required();
        new Validator("namespace", namespace).string();

        this.setMethod = setMethod;
        this.getMethod = getMethod;
        this.removeMethod = removeMethod;
        this.namespace = namespace;
    }

    _getKey(key: string) {
        return this.namespace ? `${this.namespace}-${key}` : key;
    }

    async set(key: string, data: any) {
        if (!this.setMethod) return;
        new Validator("key", key).required().string();

        const dataStr = JSON.stringify(data);
        return await this.setMethod(this._getKey(key), dataStr);
    }

    async get(key: string) {
        new Validator("key", key).required().string();
        if (!this.getMethod) return;
        const dataStr = await this.getMethod(this._getKey(key));
        return JSON.parse(dataStr);
    }

    async remove(key: string) {
        new Validator("key", key).required().string();
        if (!this.removeMethod) return;
        return await this.removeMethod(this._getKey(key));
    }
}

export {
    StorageService
};