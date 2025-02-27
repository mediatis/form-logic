/**
 * HOW-TO
 *
 * ... add actions externally
 * (Don't change existing actions, rather change their corresponding helper function from _default-helper.js)
 *
 * window.formLogic = window.formLogic || {};
 * window.formLogic = window.formLogic || {};
 * window.formLogic.actions = window.formLogic.actions || {};
 * window.formLogic.actions.myNewAction = function(fieldId, [...additionalArguments], skipAnimation) {
 *     // implement your new action
 * };
 *
 * If the new action is complicated, consider writing a helper function, see _default-helper.js
 */

export const actions =  {
  enable: function(fieldId, skipAnimation) {
    const fields = this.getFields(fieldId);
    this._helper.disabled(fields, 'unset', skipAnimation);
    return this;
  },
  disable: function(fieldId, skipAnimation) {
    const fields = this.getFields(fieldId);
    this._helper.disabled(fields, 'set', skipAnimation);
    return this;
  },

  // Use to show multiselect options
  showOption: function(fieldId, skipAnimation) {
    const fields = this.getFields(fieldId);
    this._helper.optionVisible(fields, 'set', skipAnimation);
    return this;
  },
  // Use to hide multiselect options
  hideOption: function(fieldId, skipAnimation) {
    const fields = this.getFields(fieldId);
    this._helper.optionVisible(fields, 'unset', skipAnimation);
    return this;
  },

  show: function(fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.visibleWrap(fields, 'set', skipAnimation);
    return this;
  },
  hide: function(fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.visibleWrap(fields, 'unset', skipAnimation);
    return this;
  },
  toggle: function(fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.visibleWrap(fields, 'toggle', skipAnimation);
    return this;
  },

  showElement: function(fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.visible(fields, 'set', skipAnimation);
    return this;
  },
  hideElement: function(fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.visible(fields, 'unset', skipAnimation);
    return this;
  },
  toggleElement: function(fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.visible(fields, 'toggle', skipAnimation);
    return this;
  },

  fadeIn: function (fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.fadeWrap(fields, 'set', skipAnimation);
    return this;
  },
  fadeOut: function (fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.fadeWrap(fields, 'unset', skipAnimation);
    return this;
  },

  slideDown: function (fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.slideWrap(fields, 'set', skipAnimation);
    return this;
  },
  slideUp: function (fieldId, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.slideWrap(fields, 'unset', skipAnimation);
    return this;
  },

  class: function(fieldId, action, className, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.classWrap(fields, action, className, skipAnimation);
    return this;
  },
  addClass: function(fieldId, className, skipAnimation) {
    return this.class(fieldId, 'set', className, skipAnimation);
  },
  removeClass: function(fieldId, className, skipAnimation) {
    return this.class(fieldId, 'unset', className, skipAnimation);
  },
  toggleClass: function(fieldId, className, skipAnimation) {
    return this.class(fieldId, 'toggle', className, skipAnimation);
  },

  collapse: function(fieldId, action, skipAnimation) {
    const fields = this.get(fieldId);
    this._helper.collapse(fields, action, skipAnimation);
    return this;
  },
  showCollapse: function(fieldId, skipAnimation) {
    return this.collapse(fieldId, 'set', skipAnimation);
  },
  hideCollapse: function(fieldId, skipAnimation) {
    return this.collapse(fieldId, 'unset', skipAnimation);
  },
  toggleCollapse: function(fieldId, skipAnimation) {
    return this.collapse(fieldId, 'toggle', skipAnimation);
  },

  required: function(fieldId, action, skipAnimation) {
    const fields = this.getFields(fieldId);
    this._helper.required(fields, action, skipAnimation);
    return this;
  },
  setRequired: function(fieldId, skipAnimation) {
    return this.required(fieldId, 'set', skipAnimation);
  },
  unsetRequired: function(fieldId, skipAnimation) {
    return this.required(fieldId, 'unset', skipAnimation);
  },
  toggleRequired: function(fieldId, skipAnimation) {
    return this.required(fieldId, 'toggle', skipAnimation);
  },

  readonly: function(fieldId, action, skipAnimation) {
    const fields = this.getFields(fieldId);
    this._helper.readonly(fields, action, skipAnimation);
    return this;
  },
  setReadonly: function(fieldId, skipAnimation) {
    return this.readonly(fieldId, 'set', skipAnimation);
  },
  unsetReadonly: function(fieldId, skipAnimation) {
    return this.readonly(fieldId, 'unset', skipAnimation);
  },
  toggleReadonly: function(fieldId, skipAnimation) {
    return this.readonly(fieldId, 'toggle', skipAnimation);
  },

  checked: function(fieldId, action, skipAnimation) {
    const fields = this.getFields(fieldId);
    this._helper.checked(fields, action, skipAnimation);
    return this;
  },
  setChecked: function(fieldId, skipAnimation) {
    return this.checked(fieldId, 'set', skipAnimation);
  },
  unsetChecked: function(fieldId, skipAnimation) {
    return this.checked(fieldId, 'unset', skipAnimation);
  },
  toggleChecked: function(fieldId, skipAnimation) {
    return this.checked(fieldId, 'toggle', skipAnimation);
  },

  val: function(fieldId, value, skipAnimation) {
    const fields = this.getFields(fieldId);
    if (value !== undefined) {
      this._helper.setFieldValue(fields, value, skipAnimation);
      return this;
    }
    return this._helper.fetchFieldValue(fields);
  }
};
