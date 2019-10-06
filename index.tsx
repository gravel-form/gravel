import React from 'react';
import { JSONSchema7Definition } from 'json-schema';
import compose, { MiddlewareProps } from './compose';

export interface FormMiddlewareProps extends MiddlewareProps {
  schema: JSONSchema7Definition;
  parent: FormMiddlewareProps | null;
  data: any;
  onChange: Function;
  schemaPath: (string | number)[];
  dataPath: (string | number)[];
  MiddlewareComponent: React.ComponentType<FormMiddlewareProps>;
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

const noop = () => { };

const Null = () => null;

export function bindChildProps(props: FormMiddlewareProps): ((key: string | number) => FormMiddlewareProps) | null {
  const { schema, onChange, schemaPath, dataPath } = props;
  const data = props.data || {};
  if (typeof schema === 'boolean') return null;
  if (schema.type === 'object' && schema.properties) {
    const properties = schema.properties;
    return (key) => ({
      ...props,
      schema: properties[key],
      data: data[key],
      onChange: (value: any) => onChange({ ...data, [key]: value }),
      schemaPath: [...schemaPath, 'properties', key],
      dataPath: [...dataPath, key],
      parent: props,
      next: Null,
    });
  } else if (schema.type === 'array' && Array.isArray(schema.items)) {
    const items = schema.items;
    return (key) => ({
      ...props,
      schema: items[key as number],
      data: data[key],
      onChange: (value: any) => onChange([...data.slice(0, +key), value, ...data.slice(+key + 1)]),
      schemaPath: [...schemaPath, 'items', key],
      dataPath: [...dataPath, key],
      parent: props,
      next: Null,
    });
  }
  return null;
}

export function useAdditional(
  props: FormMiddlewareProps,
  AdditionalItemTemplate: React.ComponentType<AdditionalItemTemplateProps> | null
): UseAdditional {
  const { schema, schemaPath, dataPath, onChange, MiddlewareComponent } = props;
  if (!schema || typeof schema === 'boolean' || typeof schema.items === 'boolean')
    return { onAdd: null, arrayBody: null };
  const data = props.data || Array.from(Array.isArray(schema.items) ? { length: schema.items!.length } : []);

  const onAdd = (newData: any) => onChange([...data, newData]);
  const onMove = (from: number, to: number) => {
    if (to < 0 || to >= data.length) {
      onChange([...data.slice(0, from), ...data.slice(from + 1)]);
    } else if (from < to) {
      onChange([...data.slice(0, from), ...data.slice(from + 1, to + 1), data[from], ...data.slice(to + 1)]);
    } else if (from > to) {
      onChange([...data.slice(0, to), data[from], ...data.slice(to, from), ...data.slice(from + 1)]);
    }
  };

  const [itemSchema, minIndex] = Array.isArray(schema.items)
    ? [schema.additionalItems, schema.items.length]
    : [schema.items, 0];
  if (!itemSchema) return { onAdd: null, arrayBody: null };

  const childNext = (props: FormMiddlewareProps) => <MiddlewareComponent {...props} next={Null} />;

  const bindChildProps: (i: number) => FormMiddlewareProps = (i) => ({
    ...props,
    onChange: (value: any) => {
      onChange([...data.slice(0, i), value, ...data.slice(i + 1)]);
    },
    schema: itemSchema,
    data: data[i],
    schemaPath: [...schemaPath, 'items', i],
    dataPath: [...dataPath, i],
    parent: props,
  });

  let arrayBody: React.ReactElement[] = [];
  for (let i = minIndex; i < data.length; i += 1) {
    arrayBody.push(
      AdditionalItemTemplate ? (
        <AdditionalItemTemplate
          key={i}
          {...bindChildProps(i)}
          onMove={(newIndex) => {
            if (newIndex < 0 || (newIndex >= minIndex && newIndex < data.length)) {
              onMove(i, newIndex);
            }
          }}
          next={childNext}
        />
      ) : (
          <MiddlewareComponent key={i} {...bindChildProps(i)} next={childNext} />
        )
    );
  }

  return {
    onAdd,
    arrayBody,
  };
}

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

export const FixedObjectArrayMiddleware: React.FC<FormMiddlewareProps> = (props) => {
  const { schema, next, MiddlewareComponent } = props;
  const getChildProps = bindChildProps(props);
  if (!getChildProps) return next(props);
  if (typeof schema === 'boolean') return next(props);
  const children = schema.properties || schema.items;
  if (!children) return next(props);
  return (
    <>
      {Object.keys(children).map((key) => (
        <MiddlewareComponent key={key} {...getChildProps(key)} />
      ))}
    </>
  );
};

export const FormCore: React.FC<FormProps> = ({ data, middlewares, onChange, ...rest }) => {
  const Composed = React.useMemo(() => (Array.isArray(middlewares) ? compose(middlewares) : middlewares), [
    middlewares,
  ]);
  return (
    <Composed
      {...rest}
      onChange={onChange || noop}
      data={data}
      schemaPath={[]}
      dataPath={[]}
      parent={null}
      next={Null}
      MiddlewareComponent={Composed}
    />
  );
};

export default FormCore;
