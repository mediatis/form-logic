
import { argsToArray } from "./_functions";
import { ConditionQuery } from "./_query-condition";
import { JunctionQuery } from "./_query-junction";

/**
 * chaining conditions and auto-applying actions whenever the form changes
 * consists of the prototpyes ConditionQuery, JunctionQuery and IfQuery
 */

export function IfQuery(form, parentQuery) {
  this._form = form;
  this._parentQuery = parentQuery;
  this._cbs = [];
  this._conditions = [[]]; // condition logic as DNF
  this._lastState = undefined;
  this._paused = false;
  this._negateDirectAction = false;

  this._conditionQuery = new ConditionQuery(form, this, !parentQuery);
  this._junctionQuery = new JunctionQuery(form, this, !parentQuery);
}

IfQuery.prototype.applyActions = function(actions, args, negate, skipAnimation) {
  if (typeof actions === 'function') { actions = [actions]; }
  if (typeof actions !== 'object') { actions = actions.toString().split(','); }
  for (let i = 0; i < actions.length; i++) {
    let action = actions[i];
    if (negate) { action = this._form.getActionNegative(action); }
    if (!action) { continue; }
    const _args = args.slice(0); // copy arguments for every action
    if (skipAnimation) {
      _args.push(skipAnimation);
    }
    if (typeof action === 'function') {
      action(skipAnimation);
    } else if (this._form.actionExists(action)) {
      this._form[action].apply(this._form, _args);
    } else {
      console.error('unknown command "' + action + '"');
    }
  }
};

IfQuery.prototype.trigger = function() {
  if (this._parentQuery) { return this._parentQuery.trigger(); }
  if (this._paused) { return; }
  const state = this.eval();
  if (this._lastState !== state) {
    const skipAnimation = this._lastState === undefined;
    for (let i = 0; i < this._cbs.length; i++) {
      this._cbs[i](state, skipAnimation);
    }
    this._lastState = state;
  }
};

IfQuery.prototype.addCallback = function(cb) {
  if (this._parentQuery) { return this._parentQuery.addCallback(cb); }
  this._cbs.push(cb);
  if (this._lastState === undefined) {
    this.trigger();
  } else {
    cb(this.eval(), true);
  }
};

IfQuery.prototype.pause = function() {
  if (this._parentQuery) { return this._parentQuery.pause(); }
  this._paused = true;
};

IfQuery.prototype.resume = function() {
  if (this._parentQuery) { return this._parentQuery.resume(); }
  this._paused = false;
};

IfQuery.prototype.eval = function() {
  for (let i = 0; i < this._conditions.length; i++) {
    let result = true;
    for (let j = 0; j < this._conditions[i].length; j++) {
      if (!this._conditions[i][j].eval()) {
        result = false;
      }
    }
    if (result) {
      return true;
    }
  }
  return false;
};

IfQuery.prototype.negateDirectAction = function(value) {
  if (this._parentQuery) { return this._parentQuery.negateDirectAction(value); }
  if (value !== undefined) {
    this._negateDirectAction = value;
  }
  return this._negateDirectAction;
};

IfQuery.prototype.or = function() {
  this._conditions.push([]);
};

IfQuery.prototype.and = function() {};

IfQuery.prototype.addCondition = function(conditionObj) {
  this._conditions[this._conditions.length - 1].push(conditionObj);
  if (conditionObj.call) {
    conditionObj.call(this.trigger.bind(this));
  }
};

IfQuery.prototype.getJunctionQuery = function() {
  return this._junctionQuery;
};

IfQuery.prototype.getConditionQuery = function() {
  return this._conditionQuery;
};

IfQuery.prototype.getParentQuery = function() {
  return this._parentQuery;
};

IfQuery.prototype.init = function() {
  let result = this.getConditionQuery();
  if (arguments.length > 0) {
    result = result.if.apply(result, argsToArray(arguments));
  }
  return result;
};
