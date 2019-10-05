import React from 'react';
import Ajv from 'ajv';

import { JSONSchema7 } from 'json-schema';

const ajv = new Ajv({
    errorDataPath: 'property',
    allErrors: true,
    multipleOfPrecision: 8,
    schemaId: 'auto',
    unknownFormats: 'ignore',
});

export type ErrorObject = Ajv.ErrorObject;

export const ValidationErrorContext = React.createContext<Ajv.ErrorObject[] | null | undefined>(null);


export default (schema: JSONSchema7, data: any) => {
    ajv.validate(schema, data);
    return ajv.errors;
}
