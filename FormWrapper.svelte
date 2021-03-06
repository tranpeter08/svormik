<script>
  import {setContext, onMount} from 'svelte';
  import {writable, derived} from 'svelte/store';
  import {SvormikStatus} from './classes.js';

  export let initialValues = {}
    ,validate
    ,formData
    ,actions
    ;

  let wrapper;

  const formStatus = writable(new SvormikStatus());
  const formErrors = writable(null);
  const formValues = writable({});

  const formProps = derived([formStatus, formErrors, formValues], 
    ([$s, $e, $v]) => ({status: $s, errors: $e, values: $v})
  );

  actions = {setErrors, setStatus, setValues};
  setContext('formCtx', {formProps, actions});

  $: {
    formData = $formProps;
  };

  onMount(async () => {
    const inputs = wrapper.querySelectorAll(`form [name]`);
    const values = {};

    for (const input of inputs) {
      const {name} = input;
      const value = initialValues[name] || '';
      input.value = value;
      values[name] = value;
    }

    setValues(values);
  });

  export function handleSubmit(fn) {
    if (!fn) throw Error('handleSubmit requires a callback function as an argument') ;

    for (const field in $formValues) {
      validateField(field, $formValues[field]);
    };

    setStore(formStatus, {submitting: true});
    fn($formProps, actions);
  };

  export function setErrors(errors) {
    setStore(formErrors, errors);
  };

  export function setStatus(statuses) {
    setStore(formStatus, statuses);
  }

  export function setValues(values) {
    setStore(formValues, values);
  }

  function setStore(store, fields) {
    store.update(state => ({...state, ...fields}));
  };

  async function handleChange(e) {
    const {name, value} = e.target;

    if (!name) throw Error('form controls require a "name" attribute');

    setStatus({dirty: true, submitting: false});
    setValues({[name]: value});
    validateField(name, value);
  };

  async function validateField(name, value) {
    if (!validate) return;

    setStatus({hasError: false});

    if (validate.validate) {
      try {
        await validate.validate($formValues);
        return;
      } catch ({path, errors}) {
        setErrors({[path]: errors});
        setStatus({hasError: true});
        return;
      };
    }

    if (!validate[name]) return;

    const errs = [];
    const validators = validate[name];

    if (validators.validate) {
      try {
        await validators.validate(value);
        return;
      } catch ({errors}) {
        errs.push(...errors);
      };
    } else if (Array.isArray(validators)) {
      for (let validator of validators) {
        const err = validator(value, $formValues);
        if (err) {
          errs.push(err);
        };
      }
    } else {
      throw new TypeError('Svormik validate field properties must be an Array of validators, or a Yup Schema');
    }

    if (errs.length) {
      setErrors({[name]: errs});
      setStatus({hasError: true});
      return;
    };

    setErrors({[name]: null});
  };
</script>

<div
  bind:this={wrapper}
  on:change={handleChange}
>
  <slot 
    {handleSubmit} 
    formProps={$formProps}>
    {actions}
  </slot>
</div>
