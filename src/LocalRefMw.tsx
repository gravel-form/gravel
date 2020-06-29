import * as React from 'react';
import { JSONSchema7 } from 'json-schema';
import { FormMiddlewareProps, SchemaLocalRef } from './types';
import { traverse, getSchemaByPointer } from './json-schema-traverse';

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

  if (!child || child.schema === schema) return next(nextProps);

  return <MiddlewareComponent {...nextProps} schema={child.schema} schemaPath={child.path} />;
};
