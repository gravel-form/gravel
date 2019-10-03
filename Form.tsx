import React from 'react';
import { JSONSchema7Definition } from 'json-schema';
import Ajv from 'ajv';

const noop = () => { };
const Null = () => null;

export interface FormProps {
  schema: JSONSchema7Definition;
  widgets: React.ComponentType<MiddlewareProps>[];
}

export interface MiddlewareProps {
  schema: JSONSchema7Definition;
  parent: MiddlewareProps | null;
  data: any;
  onChange: Function;
  schemaPath: (string | number)[];
  dataPath: (string | number)[];
  next: (props: MiddlewareProps) => React.ReactElement | null;
}

const RenderSchemaContext = React.createContext<React.ComponentType<MiddlewareProps>>(() => <div>'not provided'</div>);

const bindChildProps: (props: MiddlewareProps) => ((key: string | number) => MiddlewareProps) | null = (props) => {
  const { schema, onChange, schemaPath, dataPath } = props;
  const data = props.data || {};
  if (typeof schema === 'boolean') return null;
  if (schema.type === 'object' && schema.properties) {
    const properties = schema.properties;
    return (key) => ({
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
};

export const FixedArrayObjectMiddleware = (props: MiddlewareProps) => {
  const WidgetComponent = React.useContext(RenderSchemaContext);
  const { schema, next } = props;
  const getChildProps = bindChildProps(props);
  if (!getChildProps) return next(props);
  if (typeof schema === 'boolean') return next(props);
  const children = schema.properties || schema.items;
  if (!children) return next(props);
  return (
    <>
      {Object.keys(children).map((key) => (
        <WidgetComponent key={key} {...getChildProps(key)} />
      ))}
    </>
  );
};

export interface UseAdditional {
  onAdd: ((newData: any) => void) | null;
  arrayBody: React.ReactElement[] | null;
}

export interface AdditionalItemTemplateProps extends MiddlewareProps {
  onMove: (newIndex: number) => void;
}

export const useAdditional: (
  props: MiddlewareProps,
  AdditionalItemTemplate: React.ComponentType<AdditionalItemTemplateProps> | null
) => UseAdditional = (props, AdditionalItemTemplate = null) => {
  const WidgetComponent = React.useContext(RenderSchemaContext);

  const { schema, schemaPath, dataPath, onChange } = props;
  if (!schema || typeof schema === 'boolean' || typeof schema.items === 'boolean')
    return { onAdd: null, arrayBody: null };
  const data = props.data || Array.from(Array.isArray(schema.items) ? { length: schema.items!.length } : []);
  const AdditionalItemComponent = AdditionalItemTemplate || WidgetComponent;

  const binItemUpdate = (index: number) => (value: any) => {
    onChange([...data.slice(0, index), value, ...data.slice(index + 1)]);
  };
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
  let arrayBody: React.ReactElement[] = [];

  if (Array.isArray(schema.items)) {
    const items = schema.items;
    if (schema.additionalItems && data.length > items.length && typeof schema.additionalItems !== 'boolean') {
      const additionalItemSchema = schema.additionalItems;
      for (let i = items.length; i < data.length; i += 1) {
        arrayBody.push(
          <AdditionalItemComponent
            key={i}
            onChange={binItemUpdate(i)}
            schema={additionalItemSchema}
            data={data[i]}
            schemaPath={[...schemaPath, 'items', i.toString()]}
            dataPath={[...dataPath, i.toString()]}
            parent={props}
            onMove={(newIndex) => {
              console.log(newIndex, data.length);
              if (newIndex < 0 || (newIndex >= items.length && newIndex < data.length)) onMove(i, newIndex);
            }}
            next={(props) => <WidgetComponent {...props} next={Null} />}
          />
        );
      }
    }
  } else if (schema.items && Array.isArray(data)) {
    const items = schema.items;
    arrayBody = data.map((itemData, i) => (
      <AdditionalItemComponent
        key={i}
        onChange={binItemUpdate(i)}
        schema={items}
        data={itemData}
        schemaPath={[...schemaPath, 'items', i.toString()]}
        dataPath={[...dataPath, 'items', i.toString()]}
        parent={props}
        onMove={(newIndex) => {
          if (newIndex < data.length) onMove(i, newIndex);
        }}
        next={(props) => <WidgetComponent {...props} next={Null} />}
      />
    ));
  }

  return {
    onAdd: (Array.isArray(schema.items) ? !!schema.additionalItems : !!schema.items) ? onAdd : null,
    arrayBody,
  };
};

export const compose: (widgets: React.ComponentType<MiddlewareProps>[]) => React.ComponentType<MiddlewareProps> = (
  widgets
) => {
  const Composed: React.FC<MiddlewareProps> = (props) => {
    const dispatch: (props: MiddlewareProps, i: number) => React.ReactElement | null = (nextProps, i) => {
      const Widget = widgets[i];
      if (i >= widgets.length) return props.next ? props.next(nextProps) : null;
      return (
        <Widget
          {...{
            ...nextProps,
            next: (_props) => dispatch(_props, i + 1),
          }}
        />
      );
    };
    return dispatch(props, 0);
  };
  return Composed;
};

export const NotFoundWidget = ({ schemaPath }: MiddlewareProps) => (
  <div>schema not supported, location {schemaPath.join('.')}</div>
);

const ajv = new Ajv();

const Form: React.FC<FormProps> = (props) => {
  const WidgetComponent = React.useMemo(() => compose(props.widgets), [props.widgets]);
  const [data, setData] = React.useState({});
  const errors = React.useMemo(() => {
    ajv.validate(props.schema, data);
    return ajv.errors;
  }, [props.schema, data]);
  return (
    <RenderSchemaContext.Provider value={WidgetComponent}>
      <WidgetComponent
        schema={props.schema}
        onChange={setData}
        data={data}
        schemaPath={[]}
        dataPath={[]}
        parent={null}
        next={() => null}
      />
      <div>{JSON.stringify(data)}</div>
      <div>{JSON.stringify(errors)}</div>
    </RenderSchemaContext.Provider>
  );
};

export default Form;

export const isRequired = ({ parent, dataPath }: MiddlewareProps) =>
  !!parent &&
  typeof parent.schema !== 'boolean' &&
  parent.schema.required &&
  parent.schema.required.includes(dataPath[dataPath.length - 1].toString());

export const formSchema: JSONSchema7Definition = {
  type: 'object',
  required: ['foo'],
  title: 'Form',
  properties: {
    foo: { type: 'string', description: 'foo bar baz', title: 'Foooo!' },
    bar: { type: 'integer', enum: ['a', 'b', 'c'] },
    baz: {
      type: 'object',
      properties: {
        qux: { type: 'string' },
      },
    },
    qux: {
      type: 'array',
      title: 'array schema',
      description: 'array description',
      items: { type: 'object', required: ['a2'], properties: { a1: { type: 'string' }, a2: { type: 'string' } } },
    },
    multipleChoicesList: {
      type: 'array',
      title: 'A multiple choices list',
      items: {
        type: 'string',
        enum: ['foo', 'bar', 'fuzz', 'qux'],
      },
      uniqueItems: true,
    },
  },
};
