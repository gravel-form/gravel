import React from 'react';
import { JSONSchema7Definition } from 'json-schema';
import compose, { MiddlewareProps } from './compose';

export interface FormMiddlewareProps<FP = {}> extends MiddlewareProps {
  schema: JSONSchema7Definition;
  parent: FormMiddlewareProps | null;
  data: unknown;
  onChange: Function;
  schemaPath: (string | number)[];
  dataPath: (string | number)[];
  MiddlewareComponent: React.ComponentType<FormMiddlewareProps>;
  formProps: FormProps & FP;
}

export interface FormProps {
  schema: JSONSchema7Definition;
  middlewares: React.ComponentType<FormMiddlewareProps> | React.ComponentType<FormMiddlewareProps>[];
  data?: unknown;
  onChange?: (data: unknown) => void;
}

const noop = () => {};

const Null = () => null;

export function toJSONSchemaPath(dataPath: (string | number)[]): string {
  return dataPath.map((key) => (typeof key === 'number' ? `[${key}]` : '.' + key)).join('');
}

export function isRequired({ parent, dataPath }: FormMiddlewareProps): boolean {
  const field = dataPath[dataPath.length - 1];
  return !!(
    parent &&
    typeof parent.schema !== 'boolean' &&
    parent.schema.required &&
    typeof field === 'string' &&
    parent.schema.required.includes(field)
  );
}

export const FixedObjectMw: React.FC<FormMiddlewareProps> = (props) => {
  const { schema, schemaPath, dataPath, onChange, MiddlewareComponent, next } = props;
  if (typeof schema === 'boolean' || schema.type !== 'object') return next(props);
  const data: any = (typeof props.data === 'object' && props.data) || {};
  const properties = schema.properties;
  if (!properties) return next(props);
  return (
    <>
      {Object.keys(properties).map((key) => (
        <MiddlewareComponent
          key={key}
          {...props}
          schema={properties[key]}
          data={Object.hasOwnProperty.call(data, key) ? data[key] : undefined}
          onChange={(value: unknown) => onChange({ ...data, [key]: value })}
          schemaPath={[...schemaPath, 'properties', key]}
          dataPath={[...dataPath, key]}
          parent={props}
          next={Null}
        />
      ))}
    </>
  );
};

export const FixedArrayMw: React.FC<FormMiddlewareProps> = (props) => {
  const { schema, schemaPath, dataPath, onChange, MiddlewareComponent, next } = props;
  if (typeof schema === 'boolean' || schema.type !== 'array' || !schema.items || !Array.isArray(schema.items))
    return next(props);
  const data: unknown[] = (Array.isArray(props.data) && props.data) || [];
  const items = schema.items;

  return (
    <>
      {items.map((item, index) => (
        <MiddlewareComponent
          key={index}
          {...props}
          schema={items[index]}
          data={item}
          onChange={(value: unknown) => onChange([...data.slice(0, +index), value, ...data.slice(+index + 1)])}
          schemaPath={[...schemaPath, 'items', index]}
          dataPath={[...dataPath, index]}
          parent={props}
          next={Null}
        />
      ))}
    </>
  );
};

export const schemaMws = [FixedObjectMw, FixedArrayMw];

export const FormCore: React.FC<FormProps> = (props) => {
  const { schema, data, middlewares, onChange } = props;
  const Composed = React.useMemo(() => (Array.isArray(middlewares) ? compose(middlewares) : middlewares), [
    middlewares,
  ]);
  return (
    <Composed
      schema={schema}
      onChange={onChange || noop}
      data={data}
      schemaPath={[]}
      dataPath={[]}
      parent={null}
      next={Null}
      MiddlewareComponent={Composed}
      formProps={props}
    />
  );
};

export default FormCore;
