<script>
  import {setContext, onMount} from 'svelte';
  import {writable, derived} from 'svelte/store';
  import {SvormikErrors, SvormikStatus, SvormikValues} from './classes.js';

  export let initialValues = {}
    ,validate
    ,formData
    ;

  let wrapper;

  const formStatus = writable(new SvormikStatus());
  const formErrors = writable(new SvormikErrors());
  const formValues = writable(new SvormikValues(initialValues));

  const formProps = derived([formStatus, formErrors, formValues], 
    ([$s, $e, $v]) => ({status: $s, errors: $e, values: $v})
  );

  setContext('formProps', formProps);

  $: {
    formData = $formProps;
  };

  onMount(async () => {
    for (let field in initialValues) {
      const elem = wrapper.querySelector(`form [name="${field}"]`);
      elem.value = initialValues[field];

      const errs = await errorMsgs(field, initialValues[field]);

      if (errs.length) setErrors({[field]: errs});
    };
  });

  export function handleSubmit(fn) {
    setStore(formStatus, {submitting: true});
    fn($formProps, setErrors, setStatus);
  };

  export function setErrors(errObj) {
    setStore(formErrors, errObj);
  };

  export function setStatus(statusObj) {
    setStore(formStatus, status);
  }

  function setStore(store, fields) {
    store.update(state => ({...state, ...fields}));
  };

  async function handleChange(e) {
    const {name, value} = e.target;

    if (!name) return;

    setStore(formStatus, {dirty: true, submitting: false});
    setStore(formValues, {[name]: value});

    const errs = await errorMsgs(name, value);
    setErrors({[name]: errs});
  };

  async function errorMsgs(name, value) {
    if (!validate || !validate[name]) return;

    if (validate.validate) {
      try {
        await validate.validate($formValues);
        return null;
      } catch (error) {
        return error.errors;
      };
    }

    if (validate[name].validate) {
      try {
        await validate[name].validate(value);
        return null;
      } catch (error) {
        return error.errors;
      };
    };

    const errs = [];
    
    for (let validator of validate[name]) {
      const err = validator(value, $formValues);
      if (err) {
        errs.push(err);
      };
    };

    return errs.length ? errs : null;
  };
</script>

<div
  bind:this={wrapper}
  on:change={handleChange}
>
  <slot></slot>
</div>
