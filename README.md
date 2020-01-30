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

## `formData`

Contains all form data, such as, values, errors and form status.

- `values: {field: value}` - contains field values.
- `errors: {field: [errorMsgs]}` - contains field errors as an **array** of error messages.
- `status` - has status of different form properties (ie submitting, dirty, etc...). _still in progress_

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

## `validate`

Set to an Object containing keys of the field names that need to be validated and an array of custom validation functions or a Yup schema for the value.
If using custom functions and if there is an error, return a message, else return a falsey value.

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

## `handleSubmit`

A function that accepts a callback and should be invoked on submit. The callback will be passed `formProps` and the `setError` and `setStatus` function as parameters.

- `formProps` contains same data as [formData](#formdata).
- `setErrors` see [setErrors](#seterrors).
- `setStatus` see [setStatus](#setstatus).

```html
<script>
  import {Svormik} from 'svormik';

  let handleSubmit;

  function onSubmit(e) {
    handleSubmit(sendData);
  }

  function sendData(formProps, setErrors, setStatus) {
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

## `setErrors`

A function that accepts an object as an argument that contains the keys of field names and an array of error messages as the values. Updates the **formError** store.

```html
<script>
  import {Svormik} from 'svormik';

  let handleSubmit;

  function onSubmit(e) {
    handleSubmit(sendData);
  }

  function sendData(formProps, setErrors) {
    try {
      await asyncFn(formProps.values);
    } catch (error) {
      setErrors({[error.location]: error.message});
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

```html
<script>
  import {Svormik} from 'svormik';

  let handleSubmit;

  function onSubmit(e) {
    handleSubmit(sendData);
  }

  function sendData(formProps, setErrors, setStatus) {
    try {
      await asyncFn(formProps.values);
    } catch (error) {
      setErrors({[error.location]: error.message});
      setStatus({submitting: false});
    }
  }
</script>

<Svormik bind:handleSubmit>
  <form on:submit|preventDefault="{onSubmit}">
    ...
  </form>
</Svormik>
```

# Context

If using custom input components, the components can subscribe to the **formProps** derived store for useful things such as error handling.

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

  let formProps = getContext('formProps'); // subscribe to formProps changes
  let errors;

  $: errors = $formProps.errors;
</script>

<label>
  Some Label
  <input {name} />
  {#if errors[name] && errors[name].length}
  <span>{errors[name][0]}</span>
  {/if}
</label>
```
