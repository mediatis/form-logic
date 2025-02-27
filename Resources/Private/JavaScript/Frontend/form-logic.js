
import { deepExtend } from "./form-logic/_functions";
import { defaultFormHelper } from "./form-logic/_defaults";
import { FormApi } from "./form-logic/_api";

// fetch external overwrites of base functionality
window.formLogic = deepExtend({}, defaultFormHelper, window.formLogic || {});

document.addEventListener('DOMContentLoaded', () => {
  const ds = window.formLogic;
  for (let formId in ds.formScripts) {

    // build form API
    const form = document.getElementById(formId);
    const formApi = new FormApi(form, ds);
    ds.formApis[formApi.id()] = formApi;

    // run form scripts
    const script = ds.formScripts[formId];
    script(formApi);

    document.dispatchEvent(new CustomEvent('form-logic-form-ready', { detail: { id: formId } }));
    // Legacy event
    document.dispatchEvent(new CustomEvent('dependency-script-form-ready', { detail: { id: formId } }));
  }
  document.dispatchEvent(new CustomEvent('form-logic-script-ready'));
  // Legacy event
  document.dispatchEvent(new CustomEvent('dependency-script-ready'));
});
