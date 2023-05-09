declare class Validator {
    value: any;
    label: string;
    isRequired: boolean;
    constructor(label: string, value: any);
    _throwError(message: string): void;
    _isDefined(): boolean;
    _onCondition(condition: () => any, message: string): this;
    required(message?: string): this;
    string(message?: string): this;
    buffer(message?: string): this;
    function(message?: string): this;
    boolean(message?: string): this;
    number(message?: string): this;
    array(message?: string): this;
    privateKey(message?: string): this;
    mnemonic(message?: string): this;
}
export default Validator;
