import * as React from 'react';
import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';
import { MiddlewareProps } from './compose';
interface SchemaLocalRef {
    schema: JSONSchema7Definition;
    path: (string | number)[];
}
export interface FormMiddlewareProps<FP = {}> extends MiddlewareProps {
    schema: JSONSchema7Definition;
    parent: FormMiddlewareProps | null;
    data: unknown;
    onChange: Function;
    schemaPath: (string | number)[];
    dataPath: (string | number)[];
    MiddlewareComponent: React.ComponentType<FormMiddlewareProps>;
    formProps: FormProps & FP;
    localRefs?: {
        [key: string]: SchemaLocalRef;
    };
}
export interface FormProps {
    schema: JSONSchema7;
    middlewares: React.ComponentType<FormMiddlewareProps> | React.ComponentType<FormMiddlewareProps>[];
    data?: unknown;
    onChange?: (data: unknown) => void;
}
export declare function toJSONSchemaPath(dataPath: (string | number)[]): string;
export declare function isRequired({ parent, dataPath }: FormMiddlewareProps): boolean;
export declare const FixedObjectMw: React.FC<FormMiddlewareProps>;
export declare const FixedArrayMw: React.FC<FormMiddlewareProps>;
export declare const LocalRefMw: React.FC<FormMiddlewareProps>;
export declare const schemaMws: React.FC<FormMiddlewareProps<{}>>[];
export declare const FormCore: React.FC<FormProps>;
export default FormCore;
