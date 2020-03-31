import React from 'react';
import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';
import compose, { MiddlewareProps } from './compose';
import { traverse, getSchemaByPointer } from './json-schema-traverse';

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
  localRefs?: { [key: string]: SchemaLocalRef };
}

export interface FormProps {
  schema: JSONSchema7;
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

function resolveSchemaRef(
  rootSchema: JSONSchema7,
  refs: { [key: string]: SchemaLocalRef },
  ref: string
): SchemaLocalRef | null {
  const stack: string[] = [];
  let result: SchemaLocalRef | null = null;
  let _ref: string = ref;
  while (!stack.includes(_ref)) {
    if (ref.startsWith('#/')) {
      result = getSchemaByPointer(rootSchema, ref);
    } else if (ref.startsWith('#')) {
      const id = ref;
      result = refs[id];
    }
    if (!result) return null;
    if (typeof result.schema !== 'object' || !result.schema.$ref) {
      return result;
    }
    stack.push(_ref);
    _ref = result.schema.$ref;
    result = null;
  }
  return null;
}

export const LocalRefMw: React.FC<FormMiddlewareProps> = (props) => {
  const { schema, formProps, next, MiddlewareComponent, localRefs } = props;

  const refs: { [key: string]: SchemaLocalRef } = React.useMemo(() => {
    if (localRefs) return localRefs;
    const refs: { [key: string]: SchemaLocalRef } = {};
    for (const ref of traverse(formProps.schema)) {
      const $id = ref.schema.$id;
      if (!$id || !$id.startsWith('#')) continue;
      refs[$id] = ref;
    }
    return refs;
  }, [formProps.schema, localRefs]);

  const nextProps = refs !== localRefs ? props : { ...props, localRefs: refs };
  if (typeof schema === 'boolean' || !schema.$ref || !schema.$ref.startsWith('#')) return next(nextProps);

  const child = schema.$ref ? resolveSchemaRef(formProps.schema, refs, schema.$ref) : null;
  //console.log(child);
  //return next(nextProps);

  if (!child || child.schema === schema) return next(nextProps);

  return <MiddlewareComponent {...nextProps} schema={child.schema} schemaPath={child.path} />;
};

export const schemaMws = [FixedObjectMw, FixedArrayMw, LocalRefMw];

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
