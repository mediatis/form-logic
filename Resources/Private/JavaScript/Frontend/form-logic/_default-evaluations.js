
/**
 * HOW-TO
 *
 * ... adjust or add evaluations externally
 *
 * window.formLogic = window.formLogic || {};
 * window.formLogic = window.formLogic || {};
 * window.formLogic.evaluations = window.formLogic.evaluations || {};
 *
 * window.formLogic.evaluations['empty'] = function(condition, field, value) {
 *     // update the core implementation
 * }
 *
 * window.formLogic.evaluations['my-new-evaluation'] = function(condition, field, value) {
 *     // implement your new evaluation
 * };
 *
 * The key of the condition will be used as a regular expression on the condition for direct evaluations and in queries.
 *
 * Examples:
 *
 * window.formLogic.evaluations['my-new-evaluation'] = function(condition, field, value) { ... }
 * form.eval('text-1', 'my-new-evaluation')
 * form.if('my-new-evaluation', 'text-1').then(...)
 *
 * window.formLogic.evaluations['something.*'] = function(condition, field, value) { ... }
 * form.eval('somethingBad', 'text-1')
 * form.if('somethingBad', 'text-1').then(...)
 */

export const evaluations = {
  'required': function(condition, field, value) { return field.required; },
  'not-required': function(condition, field, value) { return !field.required; },

  'readonly': function(condition, field, value) { return field.readOnly; },
  'not-readonly': function(condition, field, value) { return !field.readOnly; },

  'empty': function(condition, field, value) { return !value; },
  'false': function(condition, field, value) { return !value; },

  'not-empty': function(condition, field, value) { return !!value; },
  'true': function(condition, field, value) { return !!value; },

  'valid': function(condition, field, value) {
    if (field.tagName === 'OPTION') {
      field = field.closest('SELECT');
    }
    return field.checkValidity();
  },
  'not-valid': function(condition, field, value) {
    if (field.tagName === 'OPTION') {
      field = field.closest('SELECT');
    }
    return !field.checkValidity();
  },

  'value:.+': function(condition, field, value) { return value === condition.substr(6); },
  'not:.+': function(condition, field, value) { return value !== condition.substr(4); },

  'file-extension:.+': function (condition, field, value) {
    const extension = value.indexOf('.') !== -1 ? value.split('.').pop().toLowerCase() : '';
    const whitelist = condition.substr(15).toLowerCase().split(',');
    return extension && whitelist.indexOf(extension) !== -1;
  },
  'not-file-extension:.+': function (condition, field, value) {
    const extension = value.indexOf('.') !== -1 ? value.split('.').pop().toLowerCase() : '';
    const blacklist = condition.substr(19).toLowerCase().split(',');
    return !extension || blacklist.indexOf(extension) === -1;
  }
};

// default result values for evaluations on non-existent fields or field sets
export const evaluationDefaults = {
  'required': false,
  'not-required': true,

  'readonly': false,
  'not-readonly': true,

  'empty': true,
  'false': true,

  'not-empty': false,
  'true': false,

  'valid': false,
  'not-valid': true,

  'value:.+': false,
  'not:.+': true,

  'file-extension:.+': false,
  'not-file-extension:.+': true
};
