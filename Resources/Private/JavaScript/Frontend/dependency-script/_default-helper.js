
import { argsToArray, closest, find } from "./_functions";

/**
 * HOW-TO
 *
 * ... adjust or add helper functions externally
 *
 * window.formLogic = window.formLogic || {};
 * window.formLogic.dependencyScript = window.formLogic.dependencyScript || {};
 * window.formLogic.dependencyScript.helper = window.formLogic.dependencyScript.helper || {};
 *
 * window.formLogic.dependencyScript.helper.fetchFieldWrapper = function(fields) {
 *     // update core implementation
 * };
 *
 * window.formLogic.dependencyScript.helper.myNewHelperFunction = function(...) {
 *     // implement your new helper function
 * };
 *
 * ... add action negative affixes
 *
 * window.formLogic.dependencyScript.helper.negatives = window.formLogic.dependencyScript.helper.negatives || {};
 *
 * window.formLogic.dependencyScript.helper.negatives.prefixes = window.formLogic.dependencyScript.helper.negatives.prefixes || {};
 * window.formLogic.dependencyScript.helper.negatives.prefixes['foo'] = 'bar';
 *
 * window.formLogic.dependencyScript.helper.negatives.postfixes = window.formLogic.dependencyScript.helper.negatives.postfixes || {};
 * window.formLogic.dependencyScript.helper.negatives.postfixes['foo'] = 'bar';
 *
 * ... change class names used by the core
 * window.formLogic.dependencyScript.helper.classNames = window.formLogic.dependencyScript.helper.negatives.classNames || {};
 * window.formLogic.dependencyScript.helper.classNames.requiredIndicator = 'is-required';
 *
 */

export const helper =  {

  // HTML tags that qualify as form input
  fieldTags: ['INPUT', 'SELECT', 'TEXTAREA', 'OPTION'],

  // affix rules to negate actions automatically
  negatives: {
    prefixes: {
      'add': 'remove',
      'show': 'hide',
      'en': 'dis',
      'un': '',
      'dis': '',
      're': ''
    },
    postfixes: {
      'in': 'out',
      'up': 'down'
    }
  },

  classNames: {
    requiredIndicator: 'required',
    optionalIndicator: '',
    wrap: 'form-group',
    label: 'control-label',
    collapseTarget: 'collapse',
    collapseShow: 'show'
  },

  content: {
    requiredIndicator: '*',
    optionalIndicator: '(optional)',
  },

  placement: {
    requiredIndicator: 'after', // 'inside'|'after'|''
    optionalIndicator: 'after'  // 'inside'|'after'|''
  },

  // wraps a single dom element in an array
  // converts a NodeList to an array
  normalizeFields: function(fields) {
    if (fields.tagName) {
      return [fields];
    }
    const result = [];
    for (let i = 0; i < fields.length; i++) {
      result.push(fields[i]);
    }
    return result;
  },

  // applyToElements(elements, action, ...arguments, skipAnimation, getStatus, updateStatus)
  // supports the actions 'set', 'unset' and 'toggle'
  applyToElements: function() {
    const args = argsToArray(arguments);
    const elements = this.normalizeFields(args.shift());
    const action = args.shift();
    const updateStatus = args.pop();
    const getStatus = args.pop();

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      // getStatus(element, ...arguments)
      const argsGetStatus = args.slice(0);
      argsGetStatus.unshift(element);
      const currentStatus = getStatus.apply(this, argsGetStatus);

      let nextStatus = false;
      switch (action) {
        case 'set':
          nextStatus = true;
          break;
        case 'unset':
          nextStatus = false;
          break;
        case 'toggle':
          nextStatus = !currentStatus;
          break;
      }
      if (currentStatus !== nextStatus) {
        // updateStatus(element, nextStatus, ...arguments, skipAnimation)
        const argsUpdateStatus = args.slice(0);
        argsUpdateStatus.unshift(nextStatus);
        argsUpdateStatus.unshift(element);
        updateStatus.apply(this, argsUpdateStatus);
      }
    }
  },

  triggerFieldUpdate: function(fields) {
    fields = this.normalizeFields(fields);
    for (let i = 0; i < fields.length; i++) {
      fields[i].dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { automatic: true } }));
      fields[i].dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { automatic: true } }));
    }
  },

  getUniqueFieldId: function(formId, fieldId, aliases) {
    return aliases[fieldId] || (formId + '-' + fieldId);
  },

  // determines the current value of the first active form field from a list of form fields
  // regardless of its type
  // input text fields and text areas are always considered active
  // checkboxes are only considered active if checked, their default value is assumed to be 0
  // radio buttons are only considered active if checked, if no radio button is checked, their default value is assumed to be 0
  fetchFieldValue: function(fields) {
    fields = this.normalizeFields(fields);
    let result = null;
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.type === 'radio') {
        result = 0;
        if (field.checked) {
          return field.value;
        }
      } else if (field.type === 'checkbox') {
        return field.checked ? field.value : 0;
      } else {
        return field.value;
      }
    }
    return result;
  },

  fetchFieldLabelElement: function(fields) {
    const result = [];
    fields = this.normalizeFields(fields);
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const wrap = this.fetchFieldWrapper(field).shift();

      // search for linked label tag
      let labelElement = wrap.querySelector('label[for="' + field.id + '"]');

      // search for surrounding label tag
      if (!labelElement) {
        labelElement = closest(field, 'label');
      }

      // search for any label tag within the wrapping container with the correct class
      if (!labelElement) {
        labelElement = wrap.querySelector('.' + this.classNames.label);
      }

      // search for any label within the wrapping container
      if (!labelElement) {
        labelElement = wrap.querySelector('label');
      }

      if (labelElement) {
        result.push(labelElement);
      }
    }
    return result;
  },

  getIndicator: function(fields, className, content, placement) {
    if (!className) {
      return [];
    }
    const selector = '.' + className.split(' ').join('.');
    const indicatorMarkup = ' <span class="' + className + '">' + content + '</span>';
    const wraps = this.fetchFieldWrapper(fields);
    const result = [];
    for (let i = 0; i < wraps.length; i++) {
      const wrap = wraps[i];
      let indicator = wrap.querySelector(selector);
      if (!indicator) {
        const label = this.fetchFieldLabelElement(wrap).shift();
        if (!label) {
          wrap.innerHTML = wrap.innerHTML + indicatorMarkup;
        } else if (placement === 'inside') {
          label.innerHTML = label.innerHTML + indicatorMarkup;
        } else {
          label.outerHTML = label.outerHTML + indicatorMarkup;
        }
        indicator = wrap.querySelector(selector);
        this.visible(indicator, 'unset');
      }
      result.push(indicator);
    }
    return result;
  },

  // returns the dom element representing the required indicator ("*")
  // if no such element can be found, a new one will be created (initially hidden)
  getRequiredIndicator: function(fields) {
    return this.getIndicator(fields, this.classNames.requiredIndicator, this.content.requiredIndicator, this.placement.requiredIndicator);
  },

  getOptionalIndicator: function(fields) {
    return this.getIndicator(fields, this.classNames.optionalIndicator, this.content.optionalIndicator, this.placement.optionalIndicator);
  },

  // returns the label of the first form field from a list of form fields
  // regardless of its type
  fetchFieldLabel: function(fields) {
    let labelElement = this.fetchFieldLabelElement(fields).shift();
    if (!labelElement) {
      labelElement = this.fetchFieldWrapper(fields).shift();
    }
    labelElement = labelElement.cloneNode(true);
    const removeIndicators = (element, className) => {
      if (!className) {
        return;
      }
      const indicators = element.querySelectorAll('.' + className);
      for (let i = 0; i < indicators.length; i++) {
        indicators[i].remove();
      }
    };
    removeIndicators(labelElement, this.classNames.requiredIndicator);
    removeIndicators(labelElement, this.classNames.optionalIndicator);
    return labelElement.innerText;
  },

  // determines the internal ID of the first form field (or a container) from a list of form fields (or containers)
  fetchFieldId: function(fields) {
    const field = this.normalizeFields(fields).shift();
    if (field) {
      const formId = closest(field, 'form').id;
      if (!field.id) {
        const parent = closest(field,'form,[id]');
        if (!parent || parent.tagName === 'FORM') {
          return '';
        }
        return parent.id.substr(formId.length + 1);
      }
      return field.id.substr(formId.length + 1);
    }
    return null;
  },

  // fetches the wrapping divs that belong to the given form fields
  fetchFieldWrapper: function(fields) {
    const wraps = [];
    fields = this.normalizeFields(fields);
    for (let i = 0; i < fields.length; i++) {
      const wrap = closest(fields[i], '.' + this.classNames.wrap + ',form');
      wraps.push(wrap && wrap.tagName !== 'FORM' ? wrap : fields[i]);
    }
    return wraps;
  },

  // sets the value of a form field
  // regardless of its type
  setFieldValue: function (fields, value, skipAnimation) {
    fields = this.normalizeFields(fields);
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.type === 'radio' || field.type === 'checkbox') {
        if (typeof value === 'number' || typeof value === 'string') {
          // form.val('radiogroup-1', 'yes'),
          if (field.value.toString() === value.toString()) {
            this.checked(field, 'set', skipAnimation);
          }
        } else {
          // form.val('radiogroup-1:yes', true),
          this.checked(field, value ? 'set' : 'unset', skipAnimation);
        }
      } else {
        // form.val('text-1', 'foobar')
        if (field.value !== value) {
          field.value = value;
          this.triggerFieldUpdate(field);
        }
      }
    }
  },

  // updates the checked property of a checkbox or radio button
  checked: function(fields, action, skipAnimation) {
    this.applyToElements(
      fields,
      action,
      skipAnimation,
      field => (field.type === 'checkbox' || field.type === 'radio') && field.checked,
      (field, status, skipAnimation) => {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = status;
          this.triggerFieldUpdate(field);
        }
      }
    );
  },

  // updates the required state of a form field
  required: function(fields, action, skipAnimation) {
    this.applyToElements(
      fields,
      action,
      skipAnimation,
      field => field.required,
      (field, status, skipAnimation) => {
        const requiredIndicator = this.getRequiredIndicator(field);
        const optionalIndicator = this.getOptionalIndicator(field);
        field.required = status;
        this.fade(requiredIndicator, status ? 'set' : 'unset', skipAnimation);
        this.fade(optionalIndicator, status ? 'unset' : 'set', skipAnimation);
      }
    );
  },

  class: function(elements, action, className, skipAnimation) {
    this.applyToElements(
      elements,
      action,
      className,
      skipAnimation,
      (element, className) => element.classList.contains(className),
      (element, status, className, skipAnimation) => {
        if (status) {
          element.classList.add(className);
        } else {
          element.classList.remove(className);
        }
      }
    );
  },

  classWrap: function(fields, action, className, skipAnimation) {
    this.class(this.fetchFieldWrapper(fields), action, className, skipAnimation);
  },

  // updates the collapse state of a collapsible container
  collapse: function(fields, action, skipAnimation) {
    const targets = find(fields, '.' + this.classNames.collapseTarget);
    this.slide(targets, action, skipAnimation);
    if (this.classNames.collapseShow) {
      this.class(targets, action, this.classNames.collapseShow, skipAnimation);
    }
  },

  fade: function(elements, action, skipAnimation) {
    // TODO: implement fading animation
    this.visible(elements, action, skipAnimation);
  },

  fadeWrap: function(fields, action, skipAnimation) {
    this.fade(this.fetchFieldWrapper(fields), action, skipAnimation);
  },

  slide: function(elements, action, skipAnimation) {
    // TODO: implement slideUp/Down
    this.visible(elements, action, skipAnimation);
  },

  slideWrap: function(fields, action, skipAnimation) {
    this.slide(this.fetchFieldWrapper(fields), action, skipAnimation);
  },

  // updates the readonly state of a form field
  readonly: function(fields, action, skipAnimation) {
    this.applyToElements(
      fields,
      action,
      skipAnimation,
      field => field.readOnly,
      (field, status, skipAnimation) => {
        field.readOnly = status;
      }
    );
  },

  disabled: function(fields, action, skipAnimation) {
    this.applyToElements(
      fields,
      action,
      skipAnimation,
      field => field.disabled,
      (field, status, skipAnimation) => {
        field.disabled = status;
      }
    );
  },

  visible: function(elements, action, skipAnimation) {
    this.applyToElements(
      elements,
      action,
      skipAnimation,
      element => element.style.display !== 'none',
      (element, status, skipAnimation) => {
        element.style.display = status ? '' : 'none';
      }
    );
  },

  visibleWrap: function(fields, action, skipAnimation) {
    this.visible(this.fetchFieldWrapper(fields), action, skipAnimation);
  },

  optionVisible: function(fields, action, skipAnimation) {
    this.applyToElements(
      fields,
      action,
      skipAnimation,
      field => !field.hidden || !field.disabled,
      (field, status, skipAnimation) => {
        field.hidden = !status;
        field.disabled = !status;
      }
    );
    this.sanitizeSelectOption(fields);
  },

  sanitizeSelectOption: function(fields) {
    const optionVisible = field => !field.hidden || !field.disabled;
    const options = this.normalizeFields(fields);
    options.forEach(option => {
      if (!optionVisible(option)) {
        const select = option.closest('select');
        if (select !== null && select.value === option.value) {
          const allOptions = select.querySelectorAll('option');
          for (let i = 0; i < allOptions.length; i++) {
            if (optionVisible(allOptions[i])) {
              select.value = allOptions[i].value;
              break;
            }
          }
        }
      }
    });
  }
};
