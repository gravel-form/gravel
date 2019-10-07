import React from 'react';
import { JSONSchema7Definition } from 'json-schema';
import { MiddlewareProps } from './compose';
export interface FormMiddlewareProps<FP = {}> extends MiddlewareProps {
    schema: JSONSchema7Definition;
    parent: FormMiddlewareProps | null;
    data: any;
    onChange: Function;
    schemaPath: (string | number)[];
    dataPath: (string | number)[];
    MiddlewareComponent: React.ComponentType<FormMiddlewareProps>;
    formProps: FormProps & FP;
}
export interface UseAdditional {
    onAdd: ((newData: any) => void) | null;
    arrayBody: React.ReactElement[] | null;
}
export interface AdditionalItemTemplateProps extends FormMiddlewareProps {
    onMove: (newIndex: number) => void;
}
export interface FormProps {
    schema: JSONSchema7Definition;
    middlewares: React.ComponentType<FormMiddlewareProps> | React.ComponentType<FormMiddlewareProps>[];
    data?: any;
    onChange?: (data: any) => void;
}
export declare function bindChildProps(props: FormMiddlewareProps): ((key: string | number) => FormMiddlewareProps) | null;
export declare function useAdditional(props: FormMiddlewareProps, AdditionalItemTemplate: React.ComponentType<AdditionalItemTemplateProps> | null): UseAdditional;
export declare function toJSONSchemaPath(dataPath: (string | number)[]): string;
export declare function isRequired({ parent, dataPath }: FormMiddlewareProps): boolean;
export declare const FixedObjectArrayMw: React.FC<FormMiddlewareProps>;
export declare const FormCore: React.FC<FormProps>;
export default FormCore;
