import React from 'react';
import { JSONSchema4 } from 'json-schema';

export interface FormProps {
  schema: JSONSchema4;
  widgets: FormWidgetType[];
}

export interface FormWidgetProps {
  schema: JSONSchema4;
  parent: FormWidgetProps | null;
  data: any;
  onChange: Function;
  schemaPath: string[];
  dataPath: string[];
}

export interface FormWidgetPropsNext extends FormWidgetProps {
  next: (props: FormWidgetProps) => React.ReactElement | null;
}

type FormWidgetComponent = (props: FormWidgetProps) => React.ReactElement | null;

export interface FormWidgetType {
  filter: (props: FormWidgetProps) => boolean;
  Component: React.ComponentType<FormWidgetPropsNext>;
}

const RenderSchemaContext = React.createContext<FormWidgetComponent>(() => <div>'not provided'</div>);

export const ObjectWidget: FormWidgetType = {
  filter(props) {
    return props.schema.type === 'object';
  },
  Component: ({ next, ...props }) => {
    const { schema, schemaPath, dataPath, onChange } = props;
    const data = props.data || {};
    const WidgetComponent = React.useContext(RenderSchemaContext);
    if (!schema.properties) return null;
    const properties = schema.properties;
    return (
      <>
        {Object.keys(properties).map((property) => (
          <WidgetComponent
            key={property}
            schema={properties[property]}
            data={data[property]}
            onChange={(value: any) => onChange({ ...data, [property]: value })}
            schemaPath={[...schemaPath, property]}
            dataPath={[...schemaPath, property]}
            parent={props}
          />
        ))}
      </>
    );
  },
};

export interface UseArrayReturn {
  onAdd: ((newData: any) => void) | null;
  arrayBody: React.ReactElement[] | null;
}

export interface AdditionalItemTemplateProps extends FormWidgetPropsNext {
  onMove: (newIndex: number) => void;
}

export const useArray: (
  props: FormWidgetPropsNext,
  AdditionalItemTemplate: React.ComponentType<AdditionalItemTemplateProps> | null
) => UseArrayReturn = (props, AdditionalItemTemplate = null) => {
  const { schema, schemaPath, dataPath, onChange } = props;
  const data = props.data || new Array(schema.length);
  const WidgetComponent = React.useContext(RenderSchemaContext);
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
    arrayBody = items.map((itemSchema, i) => {
      return (
        <WidgetComponent
          key={i}
          onChange={binItemUpdate(i)}
          schema={itemSchema}
          data={data[i]}
          schemaPath={[...schemaPath, 'items', i.toString()]}
          dataPath={[...dataPath, 'items', i.toString()]}
          parent={props}
        />
      );
    });
    if (schema.additionalItem && data.length > items.length) {
      const additionalItemSchema = schema.additionalItem;
      for (let i = items.length; i < data.length; i += 1) {
        arrayBody.push(
          <AdditionalItemComponent
            key={i}
            onChange={binItemUpdate(i)}
            schema={additionalItemSchema}
            data={data[i]}
            schemaPath={[...schemaPath, 'items', i.toString()]}
            dataPath={[...dataPath, 'items', i.toString()]}
            parent={props}
            onMove={(newIndex) => {
              if (newIndex < 0 || newIndex >= items.length || newIndex < data.length) onMove(i, newIndex);
            }}
            next={(props) => <WidgetComponent {...props} />}
          />
        );
      }
    }
  } else if (schema.items && Array.isArray(data)) {
    arrayBody = data.map((data, i) => (
      <AdditionalItemComponent
        key={i}
        onChange={binItemUpdate(i)}
        schema={schema.items as JSONSchema4}
        data={data[i]}
        schemaPath={[...schemaPath, 'items', i.toString()]}
        dataPath={[...dataPath, 'items', i.toString()]}
        parent={props}
        onMove={(newIndex) => {
          if (newIndex < data.length) onMove(i, newIndex);
        }}
        next={(props) => {
          return <WidgetComponent {...props} />;
        }}
      />
    ));
  }

  return {
    onAdd: (Array.isArray(schema.items) ? !!schema.additionalItems : !!schema.items) ? onAdd : null,
    arrayBody,
  };
};

export const buildArrayComponent: FormWidgetType = {
  filter({ schema }) {
    return schema.type === 'array';
  },
  Component({ data }) {
    return <div>arr</div>;
  },
};

export const NotFoundWidget: FormWidgetType = {
  filter: () => true,
  Component: ({ schemaPath }) => <div>schema not supported, location {schemaPath.join('.')}</div>,
};

const createSchemaRender: (widgets: FormWidgetType[]) => FormWidgetComponent = (widgets: FormWidgetType[]) => (
  props: FormWidgetProps
) => {
  if (widgets.length === 0) return null;
  const [widget, ...restWidgets] = widgets;
  const next = (nextProps: FormWidgetProps) => createSchemaRender(restWidgets)(nextProps);
  if (widget.filter(props)) {
    const Component = widget.Component;
    return <Component {...{ ...props, next }} />;
  }
  return createSchemaRender(restWidgets)(props);
};

const Form: React.FC<FormProps> = (props) => {
  const WidgetComponent = React.useMemo(() => createSchemaRender(props.widgets), [props.widgets]);
  const [data, setData] = React.useState({});
  return (
    <RenderSchemaContext.Provider value={WidgetComponent}>
      <WidgetComponent
        schema={props.schema}
        onChange={setData}
        data={data}
        schemaPath={[]}
        dataPath={[]}
        parent={null}
      />
      {JSON.stringify(data)}
    </RenderSchemaContext.Provider>
  );
};

export default Form;

export const formSchema: JSONSchema4 = {
  type: 'object',
  required: ['foo'],
  title: 'Form',
  properties: {
    foo: { type: 'string', description: 'foo bar baz' },
    bar: { type: 'integer' },
    baz: {
      type: 'object',
      properties: {
        qux: { type: 'string' },
      },
    },
    qux: {
      type: 'array',
      items: [{ type: 'string' }, { type: 'string' }],
    },
  },
};
