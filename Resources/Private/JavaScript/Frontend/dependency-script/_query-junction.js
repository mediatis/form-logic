
import { argsToArray } from "./_functions";

export function JunctionQuery(form, query, isRoot) {
  this._form = form;
  this._query = query;
  this._isRoot = isRoot;

  // direct actions are the like: form.if(...).then().show('text-1')
  function buildDirectActionFunction(action) {
    return function() {
      const args = argsToArray(arguments);
      const fnc = query.negateDirectAction() ? 'else' : 'then';
      args.unshift(action);
      return this[fnc].apply(this, args);
    };
  }
  const allActions = this._form.getActions();
  for (let i = 0; i < allActions.length; i++) {
    const action = allActions[i];
    this[action] = buildDirectActionFunction(action);
  }
}

JunctionQuery.prototype.eval = function() {
  return this._query.eval();
};

JunctionQuery.prototype.trigger = function() {
  this._query.trigger();
  return this;
};

JunctionQuery.prototype.pause = function() {
  this._query.pause();
  return this;
};

JunctionQuery.prototype.resume = function() {
  this._query.resume();
  return this;
};

JunctionQuery.prototype.and = function() {
  this._query.and();
  let result = this._query.getConditionQuery();
  if (arguments.length > 0) {
    result = result.if.apply(result, argsToArray(arguments));
  }
  return result;
};

JunctionQuery.prototype.or = function() {
  this._query.or();
  let result = this._query.getConditionQuery();
  if (arguments.length > 0) {
    result = result.if.apply(result, argsToArray(arguments));
  }
  return result;
};

JunctionQuery.prototype.andOpenBracket = function() {
  const result = this.and();
  return result.openBracket.apply(result, argsToArray(arguments));
};

JunctionQuery.prototype.orOpenBracket = function() {
  const result = this.or();
  return result.openBracket.apply(result, argsToArray(arguments));
};

JunctionQuery.prototype.closeBracket = function() {
  let result = this;
  if (!this._isRoot) {
    result = this._query.getParentQuery().getJunctionQuery();
  }
  if (arguments.length > 0) {
    result = result.then.apply(result, argsToArray(arguments));
  }
  return result;
};

JunctionQuery.prototype.call = function(cb) {
  if (!this._isRoot) {
    const result = this.closeBracket();
    return result.call(cb);
  }
  this._query.addCallback(cb);
  return this;
};

JunctionQuery.prototype.then = function() {
  this._query.negateDirectAction(false);
  if (arguments.length > 0) {
    const args = argsToArray(arguments);
    const actions = args.shift();
    return this.call((state, skipAnimation) => {
      this._query.applyActions(actions, args, !state, skipAnimation);
    });
  }
  return this;
};

JunctionQuery.prototype.else = function() {
  this._query.negateDirectAction(true);
  if (arguments.length > 0) {
    const args = argsToArray(arguments);
    const actions = args.shift();
    return this.call((state, skipAnimation) => {
      this._query.applyActions(actions, args, state, skipAnimation);
    });
  }
  return this;
};

JunctionQuery.prototype.onlyThen = function() {
  const args = argsToArray(arguments);
  const actions = args.shift();
  return this.call((state, skipAnimation) => {
    if (state) {
      this._query.applyActions(actions, args, false, skipAnimation);
    }
  });
};

JunctionQuery.prototype.onlyElse = function() {
  const args = argsToArray(arguments);
  const actions = args.shift();
  return this.call((state, skipAnimation) => {
    if (!state) {
      this._query.applyActions(actions, args, false, skipAnimation);
    }
  });
};

JunctionQuery.prototype.once = function() {
  const args = argsToArray(arguments);
  const actions = args.shift();
  let once = false;
  return this.call((state, skipAnimation) => {
    if (!once) {
      if (state) { once = true; }
      this._query.applyActions(actions, args, !state, skipAnimation);
    }
  });
};
