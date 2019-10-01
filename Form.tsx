import React from 'react';
import { JSONSchema4 } from 'json-schema';

export interface FormProps {
  schema: JSONSchema4;
  widgets: FormWidget[];
}

export interface FormWidgetProps {
  schema: JSONSchema4;
  parent: FormWidgetProps | null;
}

export interface FormWidgetPropsNext extends FormWidgetProps {
  next: (props: FormWidgetProps) => React.ReactElement | null;
}

type FormWidgetComponent = (props: FormWidgetProps) => React.ReactElement | null;

export interface FormWidget {
  filter: (props: FormWidgetProps) => boolean;
  Component: React.ComponentType<FormWidgetPropsNext>;
}

const RenderSchemaContext = React.createContext<FormWidgetComponent>(() => <div>'not provided'</div>);

const ObjectWidget: FormWidget = {
  filter(props) {
    return props.schema.type === 'object';
  },
  Component: ({ schema, next, ...rest }) => {
    const WidgetComponent = React.useContext(RenderSchemaContext);
    if (!schema.properties) return null;
    const properties = schema.properties;
    return (
      <>
        Object
        {Object.keys(properties).map((property) => (
          <div key={property}>
            {property} {<WidgetComponent schema={properties[property]} parent={{ schema, ...rest }} />}
          </div>
        ))}
      </>
    );
  },
};

const StringWidget: FormWidget = {
  filter(props) {
    return props.schema.type === 'string';
  },
  Component: (props) => <div>string</div>,
};

const WrapStringWidget: FormWidget = {
  filter(props) {
    return props.schema.type === 'string';
  },
  Component: ({ next, ...props }) => <div>wrjjj{next(props)}wp</div>,
};

const NotFoundWidget: FormWidget = {
  filter: () => true,
  Component: () => <div>schema not supported</div>,
};

const createSchemaRender: (widgets: FormWidget[]) => FormWidgetComponent = (widgets: FormWidget[]) => (
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

  return (
    <RenderSchemaContext.Provider value={WidgetComponent}>
      <WidgetComponent schema={props.schema} parent={null} />
    </RenderSchemaContext.Provider>
  );
};

const formProps: FormProps = {
  schema: {
    type: 'object',
    properties: {
      foo: { type: 'string' },
      bar: { type: 'integer' },
      baz: {
        type: 'object',
        properties: {
          qux: { type: 'string' },
        },
      },
    },
  },
  widgets: [ObjectWidget, WrapStringWidget, StringWidget, NotFoundWidget],
};

const App: React.FC = () => {
  return <Form {...formProps} />;
};

export default App;
