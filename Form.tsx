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

type FormWidgetComponent = (props: FormWidgetProps) => React.ReactElement | null;

export interface FormWidget {
  filter: (props: FormWidgetProps) => boolean;
  get: (next: () => FormWidgetComponent) => FormWidgetComponent;
}

const RenderSchemaContext = React.createContext<FormWidgetComponent>(() => <div>'not provided'</div>);

const ObjectWidget: FormWidget = {
  filter(props) {
    return props.schema.type === 'object';
  },
  get: (next) => ({ schema, ...rest }) => {
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
  get: (next) => (props) => <div>string</div>,
};

const NotFoundWidget: FormWidget = {
  filter: () => true,
  get: () => () => <div>schema not supported</div>,
};

const createSchemaRender: (widgets: FormWidget[]) => FormWidgetComponent = (widgets: FormWidget[]) => (
  props: FormWidgetProps
) => {
  const widgetIndex = widgets.findIndex(({ filter }) => filter(props));
  if (widgetIndex < 0) return <div>'not found'</div>;
  const widget = widgets[widgetIndex];
  const WidgetComponent = widget.get(() => createSchemaRender(widgets.slice(widgetIndex)));
  return <WidgetComponent {...props} />;
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
  widgets: [ObjectWidget, StringWidget, NotFoundWidget],
};

const App: React.FC = () => {
  return <Form {...formProps} />;
};

export default App;
