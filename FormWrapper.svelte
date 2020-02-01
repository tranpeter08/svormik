<script>
  import {setContext, onMount} from 'svelte';
  import {writable, derived} from 'svelte/store';
  import {SvormikStatus} from './classes.js';

  export let initialValues = {}
    ,validate
    ,formData
    ;

  let wrapper;

  const formStatus = writable(new SvormikStatus());
  const formErrors = writable(null);
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
    setStore(formStatus, statusObj);
  }

  export function setValues(values) {
    setStore(formValues, values);
  }

  function setStore(store, fields) {
    store.update(state => ({...state, ...fields}));
  };

  async function handleChange(e) {
    const {name, value} = e.target;

    if (!name) return;

    setStatus({dirty: true, submitting: false});
    setValues({[name]: value});

    const errs = await errorMsgs(name, value);
    setErrors({[name]: errs});
  };

  async function validateField(name, value) {
    if (!validate) return;

    setStatus({hasError: false});

    if (validate.validate) {
      try {
        await validate.validate($formValues);
        return;
      } catch (error) {
        setErrors({[name]: error.errors});
        setStatus({hasError: false});
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
      } catch (error) {
        errs.push(...error.errors);
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

  // async function validateField(name, value) {
  //   if (!validate || !validate[name]) return;

  //   setStatus({hasError: false});

  //   if (validate.validate) {
  //     try {
  //       await validate.validate($formValues);
  //       return;
  //     } catch (error) {
  //       setErrors({[name]: error.errors});
  //       setStatus({hasError: false});
  //       return;
  //     };
  //   }

  //   const errs = [];

  //   if (validate[name].validate) {
  //     try {
  //       await validate[name].validate(value);
  //       return;
  //     } catch (error) {
  //       errs.push(...error.errors);
  //     };
  //   } else {
  //     for (let validator of validate[name]) {
  //       const err = validator(value, $formValues);
  //       if (err) {
  //         errs.push(err);
  //       };
  //     };
  //   }

  //   if (errs.length) {
  //     setErrors({[name]: errs});
  //     setStatus({hasError: true});
  //     return;
  //   };

  //   setErrors({[name]: null});
  // };
</script>

<div
  bind:this={wrapper}
  on:change={handleChange}
>
  <slot {handleSubmit}></slot>
</div>
