import * as React from 'react';
import { FormMiddlewareProps } from './types';
import { Null } from './utils';

export const FixedObjectMw: React.FC<FormMiddlewareProps> = (props) => {
  const { schema, schemaPath, dataPath, onChange, MiddlewareComponent, next } = props;
  if (typeof schema === 'boolean' || (schema.type && schema.type !== 'object') || !schema.properties)
    return next(props);
  const data: any = (typeof props.data === 'object' && props.data) || {};
  const properties = schema.properties;

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
