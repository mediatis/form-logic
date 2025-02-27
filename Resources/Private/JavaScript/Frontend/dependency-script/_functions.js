
export function argsToArray(obj) { return [].slice.call(obj) }

export function ucfirst(str) { return str.length > 0 ? str[0].toUpperCase() + str.substr(1) : ''; }

export function lcfirst(str) { return str.length > 0 ? str[0].toLowerCase() + str.substr(1) : ''; }

export function mergeElements(result, newElements) {
  result = result || [];
  for (let i = 0; i < newElements.length; i++) {
    if (result.indexOf(newElements[i]) !== -1) { continue; }
    result.push(newElements[i]);
  }
  return result;
}

export function matches(element, selector) {
  if (element.matches) {
    return element.matches(selector);
  }
  if (element.msMatchesSelector) {
    return element.msMatchesSelector(selector);
  }
  return false;
}

export function closest(element, selector) {
  while (element) {
    if (matches(element, selector)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

export function filter(elements, selector) {
  const result = [];
  for (let i = 0; i < elements.length; i++) {
    if (matches(elements[i], selector)) {
      result.push(elements[i]);
    }
  }
  return result;
}

export function find(elements, selector) {
  const result = [];
  for (let i = 0; i < elements.length; i++) {
    mergeElements(result, elements[i].querySelectorAll(selector));
  }
  return result;
}

export function deepExtend(out) {
  out = out || {};
  for (let i = 1; i < arguments.length; i++) {
    const obj = arguments[i];
    if (!obj) { continue; }
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (obj[key] instanceof Array) out[key] = obj[key].slice(0);
          else out[key] = deepExtend(out[key], obj[key]);
        } else out[key] = obj[key];
      }
    }
  }
  return out;
}
