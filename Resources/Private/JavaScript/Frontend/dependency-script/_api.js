
import { argsToArray, ucfirst, lcfirst, mergeElements, filter } from "./_functions";
import { IfQuery } from "./_query";

/**
 * main object for accessing and manipulating the form
 */
export function FormApi(form, settings) {
  this._helper = settings.helper;
  this._form = form;
  this._id = form.id;
  this._fieldIdAliases = {};
  this._actions = [];
  this._actionNegatives = {};
  this._evaluations = {};
  this._evaluationDefaults = {};
  this._ifQueries = [];
  this._hasChanged = false;

  let name;

  // register actions
  for (name in settings.actions) {
    this.registerAction(name, settings.actions[name]);
  }
  for (name in settings.actionNegatives) {
    this.registerActionNegative(name, settings.actionNegatives[name]);
  }

  // register evaluations
  for (name in settings.evaluations) {
    this.registerEvaluation(name, settings.evaluations[name], settings.evaluationDefaults[name]);
  }

  this.setAlias(this.id(), '<form>');

  // register any human-made form changes
  this.on('input change', '', (id, value, automatic) => {
    if (!automatic) {
      this._hasChanged = true;
    }
  });
}

FormApi.prototype.id = function() {
  return this._id;
};

FormApi.prototype.hasChanged = function() {
  return this._hasChanged;
};

FormApi.prototype.setAlias = function(uniqueId, name) {
  this._fieldIdAliases[name] = uniqueId;
};

FormApi.prototype.getUniqueFieldId = function(fieldId) {
  return this._helper.getUniqueFieldId(this.id(), fieldId, this._fieldIdAliases);
};

FormApi.prototype.getFieldAlias = function(fieldId) {
  for (let alias in this._fieldIdAliases) {
    if (this._fieldIdAliases[alias] === fieldId) {
      return alias;
    }
  }
  return '';
};

FormApi.prototype.registerAction = function(name, fnc) {
  this[name] = fnc;
  this._actions.push(name);
};

FormApi.prototype.registerActionNegative = function(name, negativeName) {
  this._actionNegatives[name] = negativeName;
  this._actionNegatives[negativeName] = name;
};

FormApi.prototype.getActions = function() {
  return this._actions;
};

FormApi.prototype.actionExists = function(action) {
  return this._actions.indexOf(action) >= 0;
};

FormApi.prototype.getActionNegative = function(action) {
  // custom functions do not have a negative by definition
  if (typeof action === 'function') { return false; }

  // if a manual negative is set, use it
  if (this._actionNegatives[action]) { return this._actionNegatives[action]; }

  // in all other cases, we try to match pre- and postfixes
  const checkAffix = (affixes, affixMatchFnc, candidateFnc) => {
    const checkSingleAffix = (affix, affixNegative) => {
      if (affixMatchFnc(action, affix)) {
        const candidates = candidateFnc(action, affix, affixNegative);
        for (let i = 0; i < candidates.length; i++) {
          let candidate = candidates[i];
          if (this.actionExists(candidate)) {
            return candidate;
          }
        }
      }
      return false;
    };
    let result;
    for (let affix in affixes) {
      const affixNegative = affixes[affix];
      result = checkSingleAffix(affix, affixNegative) || checkSingleAffix(affixNegative, affix);
      if (result) { break; }
    }
    return result;
  };

  // check for known prefixes
  // abcaction | abcAction => defaction | defAction
  let result = checkAffix(
    // affix map
    this._helper.negatives.prefixes,
    // action-affix match function
    (action, prefix) => { return action.substr(0, prefix.length) === prefix; },
    // negative-affix candidate-builder
    (action, prefix, prefixNegative) => {
      return [
        prefixNegative + lcfirst(action.substr(prefix.length)),
        prefixNegative + ucfirst(action.substr(prefix.length))
      ];
    }
  );

  // if prefixes didn't work, check for known postfixes
  // actionabc | actionAbc => actiondef | actionDef
  if (!result) {
    result = checkAffix(
      // affix map
      this._helper.negatives.postfixes,
      // action-affix match function
      (action, postfix) => {
        return lcfirst(action.substr(-postfix.length)) === lcfirst(postfix);
      },
      // negative-affix candidate-builder
      (action, postfix, postfixNegative) => {
        return [
          action.substr(0, action.length - postfix.length) + lcfirst(postfixNegative),
          action.substr(0, action.length - postfix.length) + ucfirst(postfixNegative)
        ];
      }
    );
  }

  if (result) {
    this.registerActionNegative(action, result);
  }
  return result;
};

FormApi.prototype.registerEvaluation = function(name, fnc, defaultResult) {
  this._evaluations[name] = fnc;
  this._evaluationDefaults[name] = !!defaultResult;
};

/**
 * fetches the element with the given ID, no matter if it is a form field or a container
 * fetches all form fields if the ID evaluates to false
 */
FormApi.prototype.get = function(fieldId, container, doNotLogError) {
  container = container || this._form;
  let i, j, k;
  const result = [];

  if (!fieldId) {
    // no specific field identifier means that we get all fields
    // example: form.get();
    mergeElements(result, container.querySelectorAll(this._helper.fieldTags.join(',')));
  } else {
    // get specific fields (by identifier)
    // example: form.get('text-1')

    // multiple fields can be separated by ','
    // example: form.get('checkbox-1,text-17')
    const fieldIdentifiers = fieldId.split(',');
    for (i = 0; i < fieldIdentifiers.length; i++) {
      let fieldIdentifier = fieldIdentifiers[i].trim();
      let fieldValues = [];
      const fieldValueIndex = fieldIdentifier.indexOf(':');
      if (fieldValueIndex >= 0) {
        // values of "multi-fields", like radio buttons and mulitcheckbox fields can be targeted separately
        // by adding their value to the field ID
        // example: form.get('radiobutton-1:xyz')
        // and even multiple values can be targeted
        // example: form.get('multicheckbox-1:abc:xyz,multicheckbox-2:hij')
        fieldValues = fieldIdentifier.substr(fieldValueIndex + 1).split(':');
        fieldIdentifier = fieldIdentifier.substr(0, fieldValueIndex);
      }

      const fieldUniqueIdentifier = this.getUniqueFieldId(fieldIdentifier);
      const resultFieldsOrContainers = mergeElements(
        filter([container], '[id="' + fieldUniqueIdentifier + '"]'),
        container.querySelectorAll('[id="' + fieldUniqueIdentifier + '"]')
      );

      if (!doNotLogError && resultFieldsOrContainers.length === 0) {
        console.error('no fields found for "' + fieldIdentifier + '"!');
      }

      if (fieldValues.length === 0) {
        // no value given in the field identifier
        // example: form.get('text-1,checkbox-4')
        mergeElements(result, resultFieldsOrContainers);
      } else {
        // one ore more values given in the field identifier
        // example: form.get('radiobutton-1:yes')
        // example: form.get('radiobutton-1:foo:bar,radiobutton-2:oof')
        for (j = 0; j < fieldValues.length; j++) {
          let valueFound = false;
          const fieldValue = fieldValues[j];
          const fieldValueSelector = '[value="' + fieldValue + '"]';
          // add targeted elements if they have a matching value
          const filteredResultFields = filter(resultFieldsOrContainers, fieldValueSelector);
          if (filteredResultFields.length > 0) { valueFound = true; }
          mergeElements(result, filteredResultFields);

          // add sub fields from targeted elements with matching values
          for (k = 0; k < resultFieldsOrContainers.length; k++) {
            const filteredResultSubFields = resultFieldsOrContainers[k].querySelectorAll(fieldValueSelector);
            if (filteredResultSubFields.length > 0) { valueFound = true; }
            mergeElements(result, filteredResultSubFields);
          }

          if (!doNotLogError && resultFieldsOrContainers.length > 0 && !valueFound) {
            console.error('no fields found for "' + fieldIdentifier + '" with value "' + fieldValue + '"!');
          }
        }
      }
    }
  }
  return result;
};

/**
 * fetches the form field with the given ID
 * if the ID belongs to a container, it fetches all form fields within this container
 * fetches all form fields if the ID evaluates to false
 */
FormApi.prototype.getFields = function(fieldId, container) {
  container = container || this._form;
  const elements = this.get(fieldId, container);
  const result = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (this._helper.fieldTags.indexOf(element.tagName) !== -1) {
      mergeElements(result, [element]);
    } else {
      mergeElements(result, this.get('', element));
    }
  }
  return result;
};

FormApi.prototype.getFieldWrapper = function(fieldId, container) {
  const elements = this.getFields(fieldId, container);
  return this._helper.fetchFieldWrapper(elements);
};

FormApi.prototype.getFieldLabel = function(fieldId, container) {
  const elements = this.getFields(fieldId, container);
  return this._helper.fetchFieldLabel(elements);
};

FormApi.prototype.exists = function(fieldId) {
  return this.get(fieldId, null, true).length > 0;
};

FormApi.prototype.on = function(events, fieldId, callback) {
  // example: form.on('input', function() {})
  // case on(event, callback) => on(event, '', callback)
  if (typeof fieldId === 'function') {
    callback = fieldId;
    fieldId = '';
  }

  // example: form.on('input change', 'text-1', function() {})
  if (typeof events === 'string') {
    events = events.split(' ');
  }

  const fields = this.getFields(fieldId);
  for (let i = 0; i < fields.length; i++) {
    for (let j = 0; j < events.length; j++) {
      fields[i].addEventListener(events[j], e => {
        const field = e.target;
        const automatic = !!(e.detail && e.detail.automatic);
        callback.apply(field, [this._helper.fetchFieldId(field), this._helper.fetchFieldValue(field), automatic]);
      });
    }
  }

  return this;
};

/**
 * feature to trigger actions and functions
 * under specific conditions
 * when the form fields change
 */
FormApi.prototype.if = function() {
  const query = new IfQuery(this);
  this._ifQueries.push(query);
  return query.init.apply(query, argsToArray(arguments));
};

FormApi.prototype.triggerAllQueries = function() {
  for (let i = 0; i < this._ifQueries.length; i++) {
    this._ifQueries[i].trigger();
  }
};

FormApi.prototype.eval = function(fieldId, condition) {
  const fields = this.getFields(fieldId);

  let evalFunction = function(condition, field, value) { return condition === value; };
  let evalDefault = false;
  for (let evalCondition in this._evaluations) {
    if (condition.toString().match(new RegExp('^' + evalCondition + '$'))) {
      evalFunction = this._evaluations[evalCondition];
      evalDefault = !!this._evaluationDefaults[evalCondition];
      break;
    }
  }

  if (fields.length === 0) {
    return evalDefault;
  }

  let result = true;
  for (let i = 0; i < fields.length; i++) {
    const value = this._helper.fetchFieldValue(fields[i]);
    result = result && !!evalFunction(condition, fields[i], value);
  }
  return result;
};
