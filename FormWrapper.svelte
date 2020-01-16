<script>
  import {setContext, onMount} from 'svelte';
  import {writable, derived} from 'svelte/store';

  export let initialValues = {}
    ,validate
    ,formData
    ;

  let wrapper;

  const formStatus = writable({
    submitting: false,
    dirty: false
  });

  const formErrors = writable({});
  const formValues = writable(initialValues);

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
      setErrors({[field]: errs});
    };
  });

  export function handleSubmit(fn) {
    setStore(formStatus, {submitting: true});
    fn($formProps, setErrors);
  };

  export function setErrors(errObj) {
    setStore(formErrors, errObj);
  };

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

    const errs = [];

    if (validate[name].validate) {
      try {
        await validate[name].validate(value);
        return null;
      } catch (error) {
        return error.errors;
      };
    };
    
    for (let validator of validate[name]) {
      const err = validator(value);
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
