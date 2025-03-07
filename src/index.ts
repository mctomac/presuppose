export class AssertionError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = AssertionError.name;
    }
}

export const nonEmptyStrings = assertAllFactory((propValue: unknown, propName: string) => {
    if (typeof propValue !== 'string' || propValue.length === 0) {
        return `${propName} must be non empty string`;
    }
});

export const stringsOrUndefined = assertAllFactory((propValue: unknown, propName: string) => {
    if (typeof propValue !== 'string' && propValue !== undefined) {
        return `If ${propName} is specified it must be a string`;
    }
});

export const stringsNotMatch = assertAllFactory((propValue, propName, _allProps, opts) => {
    if (typeof propValue !== 'string' || propValue?.match(opts)) {
        return `${propName} must be a string and it can't match ${opts}`;
    }
});

export const arrays = assertAllFactory((propValue: unknown, propName: string) => {
    if (!Array.isArray(propValue)) {
        return `${propName} must be an array`;
    }
});

export const arraysOfNonEmptyStrings = assertAllFactory((propValue, propName) => {
    if (!Array.isArray(propValue) || propValue.some(val => typeof val !== 'string' || val.length === 0)) {
        return `${propName} must be an array of non empty strings`;
    }
});

export const objects = assertAllFactory((propValue: unknown, propName: string) => {
    if (!(propValue instanceof Object) || Array.isArray(propValue)) {
        return `${propName} must be an object`;
    }
});

export const specificValues = assertAllFactory((propValue, propName, _allProps, opts) => {
    if (propValue !== opts) {
        return `${propName} must be ${opts}`;
    }
});

export const numbers = assertAllFactory((propValue: unknown, propName: string, _allProps, opts:unknown) => {
    const msgs = [];
    let res = true;
    opts = (typeof opts === 'object' ? opts : {});
    if (typeof propValue !== 'number') {
        res = false;
    }
    if (typeof opts?.greater === 'number') {
        msgs.push(`greater than ${opts.greater}`)
        if (propValue <= opts.greater){
            res = false;
        }
    }
    if (typeof opts?.greaterOrEqual === 'number') {
        msgs.push(`greater than or equal ${opts.greaterOrEqual}`)
        if (propValue < opts.greaterOrEqual){
            res = false;
        }
    }
    if (typeof opts?.less === 'number') {
        msgs.push(`less than ${opts.less}`)
        if (propValue >= opts.less){
            res = false;
        }
    }
    if (typeof opts?.lessOrEqual === 'number') {
        msgs.push(`less than or equal ${opts.greaterOrEqual}`)
        if (propValue > opts.greaterOrEqual){
            res = false;
        }
    }
    if (!res) {
        return `${propName} must be a number ${msgs.join(' and ')}`
    }
});

interface InputProperties {
    [key: string]: unknown;
}

function assertAllFactory(
    func: (
        prop: unknown,
        propName: string,
        allProps: InputProperties,
        opts?: any
    ) => void
) {
    return function(
        allProps: InputProperties,
        opts?: any,
        msg?: string | ((propName: string) => string)
    ) {
        Object.keys(allProps).forEach(propName => {
            const result = func(allProps[propName], propName, allProps, opts)
            if (typeof result === 'string') {
                if (typeof msg === 'function') {
                    msg = msg(propName);
                }
                msg = msg || result;
                throw new AssertionError(msg);
            }
        });
    }
}


