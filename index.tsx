import React from 'react';
import Form, { FormProps, formSchema } from './Form';
import widgets from '../theme-bootstrap4';

const formProps: FormProps = {
  schema: formSchema,
  widgets: widgets,
};

const App: React.FC = () => {
  return <Form {...formProps} />;
};

export default App;
