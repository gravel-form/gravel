# gravel
Middleware framework for react jsonschema form

## Installation
```bash
npm install @gravel-form/core-rc
```

## Build a jsonschema form from scratch

```bash
npx create-react-app my-form
cd my-form
npm install @gravel-form/core-rc ajv
```

``` jsx
import React from 'react';
import Ajv from 'ajv';
import { FixedObjectArrayMw, toJSONSchemaPath, FormCore } from '@gravel-form/core';

const ajv = new Ajv({
  errorDataPath: 'property',
  allErrors: true,
  multipleOfPrecision: 8,
  schemaId: 'auto',
  unknownFormats: 'ignore',
});

function ValidateMw(props) {
  const { parent, schema, data, next, errors } = props;
  const errs = React.useMemo(() => {
    if (parent) return null;
    ajv.validate(schema, data);
    return ajv.errors;
  }, [schema, data]);
  return next(parent ? props : { ...props, errors: errs });
}

function FormItemTemplateMw(props) {
  const { schema, dataPath, errors, next } = props;
  if (schema.type === 'object' || schema.type === 'array') return next(props);
  const id = toJSONSchemaPath(dataPath);
  const error = errors && errors.find(({ dataPath }) => dataPath === id);
  return (
    <div>
      <label>{schema.title || [dataPath.length - 1]}</label>
      <br />
      {schema.description ? (
        <>
          Description: {schema.description}
          <br />
        </>
      ) : null}
      {next(props)}
      <br />
      {error ? `Error: ${error.message}` : null}
    </div>
  );
}

function StringInput(props) {
  const { schema, data, onChange, next } = props;
  if (schema.type !== 'string') return next(props);
  return <input value={data || ''} onChange={(e) => onChange(e.target.value)} />;
}

function SubmitButton(props) {
  const {
    parent,
    next,
    formProps: { onSubmit },
  } = props;
  if (parent || !onSubmit) return next(props);
  return (
    <>
      {next(props)}
      <button onClick={onSubmit}>submit</button>
    </>
  );
}

const middlewares = [ValidateMw, FormItemTemplateMw, SubmitButton, FixedObjectArrayMw, StringInput];

const schema = {
  type: 'object',
  properties: {
    username: {
      title: 'User Name:',
      type: 'string',
    },
    password: {
      type: 'string',
      title: 'Password:',
      description: 'at least 6 characters',
      minLength: 6,
    },
  },
};

function App() {
  const [data, setData] = React.useState({});
  return (
    <>
      <FormCore
        schema={schema}
        data={data}
        middlewares={middlewares}
        onChange={setData}
        onSubmit={() => alert(JSON.stringify(data))}
      />
      <br />
      {JSON.stringify(data)}
    </>
  );
}

export default App;
```
