import * as React from 'react';
import { MiddlewareProps } from './types';
import { Null } from './utils';

export const FixedArrayMw: React.FC<MiddlewareProps> = (props) => {
  const { schema, schemaPath, dataPath, onChange, MiddlewareComponent, next } = props;
  if (typeof schema === 'boolean' || (schema.type && schema.type !== 'array') || !Array.isArray(schema.items))
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
