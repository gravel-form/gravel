import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';
export declare function getSchemaByPointer(schema: JSONSchema7, jsonPointer: string): {
    schema: JSONSchema7Definition;
    path: string[];
} | null;
export declare function traverse(schema: JSONSchema7): Generator<{
    schema: JSONSchema7;
    path: (string | number)[];
}, void, void>;
export default traverse;
