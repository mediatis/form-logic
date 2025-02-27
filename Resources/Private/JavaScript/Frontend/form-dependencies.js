
import { deepExtend } from "./dependency-script/_functions";
import { defaultFormHelper } from "./dependency-script/_defaults";
import { FormApi } from "./dependency-script/_api";

// fetch external overwrites of base functionality
window.formLogic = deepExtend({}, defaultFormHelper, window.formLogic || {});

document.addEventListener('DOMContentLoaded', () => {
  const ds = window.formLogic.dependencyScript;
  for (let formId in ds.formScripts) {

    // build form API
    const form = document.getElementById(formId);
    const formApi = new FormApi(form, ds);
    ds.formApis[formApi.id()] = formApi;

    // run dependency scripts
    const script = ds.formScripts[formId];
    script(formApi);
    document.dispatchEvent(new CustomEvent('dependency-script-form-ready', { detail: { id: formId } }));
  }
  document.dispatchEvent(new CustomEvent('dependency-script-ready'));
});
