class SvormikErrors {
  constructor() {}
}

class SvormikStatus {
  constructor() {
    this.dirty = false;
    this.submitted = false;
  }
}

class SvormikValues {
  constructor(initialValues) {
    if (initialValues) {
      for (let field in initialValues) {
        this[field] = initialValues[field];
      }
    }
  }
}

module.exports = { SvormikErrors, SvormikStatus, SvormikValues };
