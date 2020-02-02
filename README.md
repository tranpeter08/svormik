# What is Svormik?

Svormik is a wrapper for [Svelte](https://www.npmjs.com/package/svelte) form components. It helps with handling form values and errors. This wrapper component was strongly influenced by [Formik](https://www.npmjs.com/package/formik) (a popular package for form state management for React applications).

And just like Formik, Svormik can also be used with [Yup](https://www.npmjs.com/package/yup) for validating form inputs.

# Usage

To use Svormik, import it and wrap your form component.

```html

<script>
  import {Svormik} from 'svormik';
</script>

<Svorkmik>
  <form>
    ...inputs
  </form>
</Svormik>
```

# Props

## `initialValues`

Set to an Object containing keys with the associated field name and the initial value as the value.

- `initialValues: {fieldName: value}`

```html
<script>
  import {Svormik} from 'svormik';

  const initialValues = {
    username: 'foo',
    password: 'bar'
  };
</script>

<Svormik {initalValues}>
  <form>
    <input name="username" type="text" />
    <input name="password" type="password" />
  </form>
</Svormik>
```

## `formData` (bind)

Contains all form data, such as: values, errors and form status.

- `values: {field: value}` - contains field values.
- `errors: {field: [errorMsgs]}` - contains field errors as an **array** of error messages.
- `status` - has status of different form properties (ie submitting, dirty, hasError, etc...). _still in progress_

```html
<script>
  import {Svormik} from 'svormik';

  let formData;

  $: console.log(formData); // {values: ...values, errors: ...erors, status: ...status}
</script>

<Svormik bind:formData>
  <form>
    ...
  </form>
</Svormik>
```

## `actions` (bind)

Contains methods that update the **formProps** derived store. See [Actions](#Actions).

## `validate`

Set to an Object containing keys of the field names that need to be validated and an **array** of custom validation functions, or a Yup schema for the value.
If using custom functions and if there is an error, return a message, else return a falsey value.

- `validators: (value, values) => string | null`
- `validate: Schema | { fieldName: Schema | [validators] }`

```html
<script>
  import Svormik from 'svormik';

  const required = (value, values) =>
    value === undefined ? 'Field is required' : null;

  const minLength = n => (value, values) =>
    value.length < n ? `Needs to have at least ${n} characters` : null;

  const matching = fieldName => (value, values) =>
    value !== values[fieldName] ? `Doesn't match ${fieldName}` : null;

  const validate = {
    username: [required, minLength(5)],
    password: [required, minLength(10)],
    confirmPassword: [required, matching('password')]
  };
</script>

<Svormik {validate}>
  <form>
    ...
  </form>
</Svormik>
```

\- OR -

```html
<script>
  import Svormik from 'svormik';
  import * as Yup from 'yup';

  const validate = {
    username: yup
      .string()
      .required()
      .min(3),
    password: yup
      .string()
      .required()
      .min(10)
  };
</script>

<Svormik {validate}>
  <form>
    ...
  </form>
</Svormik>
```

## `handleSubmit` (bind)

A function that accepts a callback and should be invoked on submit. The callback will be passed `formProps` and `actions` that updates the stores.

- `handleSubmit: (callback) => void`
- `callback: (formProps, actions) => void`
- `formProps:` contains same data as [formData](#formdata).
- `actions:` contains [setErrors](#seterrors), [setStatus](#setstatus), and [setValues](#setvalues) methods.

```html
<script>
  import {Svormik} from 'svormik';

  let handleSubmit;

  function onSubmit(e) {
    handleSubmit(sendData);
  }

  function sendData(formProps, actions) {
    try {
      await asyncFn(formProps.values);
    } catch (errors) {
      //process errors
    }
  }
</script>

<Svormik bind:handleSubmit>
  <form on:submit|preventDefault="{onSubmit}">
    ...
  </form>
</Svormik>
```

`handleSubmit` can also be used with the **let** directive.

```html
<script>
  import {Svormik} from 'svormik';

  function sendData(formProps, actions) {
    try {
      await asyncFn(formProps.values);
    } catch (errors) {
      //process errors
    }
  }
</script>

<Svormik let:handleSubmit>
  <form on:submit|preventDefault="{() => handleSubmit(sendData)}">
    ...
  </form>
</Svormik>
```

# Actions

## `setErrors`

A function that accepts an object as an argument that contains the keys of field names or custom error fields, and either an array of error messages or a custom value for the values. Updates the **formErrors** store.

- `setErrors: ({errorName: [errorMsgs] | customValue}) => void`

```html
<script>
  import {Svormik} from 'svormik';

  let handleSubmit;

  function onSubmit(e) {
    handleSubmit(sendData);
  }

  function sendData(formProps, actions) {
    try {
      await asyncFn(formProps.values);
    } catch (error) {
      actions.setErrors({[error.location]: error.message});
    }
  }
</script>

<Svormik bind:handleSubmit>
  <form on:submit|preventDefault="{onSubmit}">
    ...
  </form>
</Svormik>
```

## `setStatus`

A function that accepts an object as an argument that contains the keys of status names and status value as the value. Updates the **formStatus** store.

- `setStatus: ({statusName: value}) => void`

```html
<script>
  import {Svormik} from 'svormik';

  let handleSubmit;

  function onSubmit(e) {
    handleSubmit(sendData);
  }

  function sendData(formProps, actions) {
    try {
      await asyncFn(formProps.values);
    } catch (error) {
      actions.setErrors({[error.location]: error.message});
      actions.setStatus({submitting: false});
    }
  }
</script>

<Svormik bind:handleSubmit>
  <form on:submit|preventDefault="{onSubmit}">
    ...
  </form>
</Svormik>
```

## `setValues`

A function that accepts an object as an argument that contains the keys of status names and status value as the value. Updates the **formValues** store.

- `setValues: ({fieldName: value}) => void`

# Context

If using custom input components, the components can subscribe to the **formProps** derived store and have access to the **actions** methods via context.

```html
<script>
  //MyForm.svelte
  import {Svormik} from 'svormik';
  import CustomInput from './CustomInput.svelte';
</script>

<Svormik>
  <form>
    <CustomInput name="fancyInput" />
  </form>
</Svormik>
```

```html
<script>
  //CustomInput.svelte
  import {getContext} from 'svelte';

  export let name;

  let {formProps, actions} = getContext('formCtx');
  let errors;

  $: errors = $formProps.errors; // subscribe to errors changes
</script>

<label>
  Some Label
  <input {name} />
  {#if errors[name] && errors[name].length}
  <span>{errors[name][0]}</span>
  {/if}
</label>
```

# `let:`

The following are available to the **let** directive:

- `handleSubmit`
- `formProps`
- `actions`
