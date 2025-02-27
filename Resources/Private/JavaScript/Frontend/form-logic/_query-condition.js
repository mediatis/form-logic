
import { argsToArray } from "./_functions";
import { IfQuery } from "./_query";

export function ConditionQuery(form, query, isRoot) {
  this._form = form;
  this._query = query;
  this._isRoot = isRoot;
}

ConditionQuery.prototype.trigger = function() {
  this._query.trigger();
  return this;
};

ConditionQuery.prototype.pause = function() {
  this._query.pause();
  return this;
};

ConditionQuery.prototype.resume = function() {
  this._query.resume();
  return this;
};

ConditionQuery.prototype.if = function(condition, fieldId) {
  // examples:
  // form.if('some-global-evaluation') // adds a global evaluation on the complete form, like form.if('some-global-evaluation', '<form>')
  // form.if(true, 'text-1') // triggers an evaluation whenever text-1 changes and adds the condition 'text-1 must not be empty'
  // form.if('foo', 'text-1') // triggers an evaluation whenever text-1 changes and adds the condition 'text-1 must be equal to "foo"'
  // form.if(function() { return someEvaluation(); }) // adds a custom condition
  // form.if(function(fieldId, value) { return someEvaluation(); }, 'text-1') // triggers an evaluation whenever text-1 changes and adds a custom condition
  // form.if(evalObj) // adds a condition object, which must have a method 'eval'
  let conditionObj = false;

  // case if(condition) => if(condition, '<form>')
  if (typeof fieldId === 'undefined') {
    fieldId = '<form>';
  }

  switch (typeof condition) {
    case 'function':
      conditionObj = {
        eval: fieldId ? () => condition(fieldId, this._form.val(fieldId)) : condition
      };
      break;
    case 'object':
      if (condition && condition.eval) {
        conditionObj = condition;
      }
      break;
    case 'string':
    case 'number':
    case 'boolean':
      conditionObj = {
        eval: () => this._form.eval(fieldId, condition)
      };
      break;
  }

  if (conditionObj) {
    this._query.addCondition(conditionObj);
  }

  // make the condition chain trigger on changes for the fields involved
  if (fieldId) {
    this.on(fieldId);
  }

  return this._query.getJunctionQuery();
};

ConditionQuery.prototype.on = function(fieldId) {
  let triggerFieldId = fieldId;
  if (fieldId) {
    // we remove the value identifier (everything after the ":")
    // so that a fieldId radiogroup-2:x:y triggers on radiogroup-2
    // thus also on radiogroup-2:z
    const fieldIds = fieldId.split(',');
    for (let i = 0; i < fieldIds.length; i++) {
      fieldIds[i] = fieldIds[i].trim().split(':').shift();
    }
    triggerFieldId = fieldIds.join(',');
  }
  this._form.on('input', triggerFieldId, () => {
    this._query.trigger();
  });
  this._form.on('change', triggerFieldId, () => {
    this._query.trigger();
  });
  return this._query.getJunctionQuery();
};

ConditionQuery.prototype.openBracket = function() {
  const childQuery = new IfQuery(this._form, this._query);
  this.if(childQuery);
  return childQuery.init.apply(childQuery, argsToArray(arguments));
};
