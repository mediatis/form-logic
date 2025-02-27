
import { actions } from "./_default-actions";
import { helper } from "./_default-helper";
import { evaluations, evaluationDefaults } from "./_default-evaluations";

/**
 * default structure for window.formLogic.dependencyScript
 */
export const defaultFormHelper = {
  dependencyScript: {

    // the scripts written in the form editor (T3 BE)
    // auto-generated
    formScripts: {},

    // completed form api for implementing dependencies and gathering information about the form
    // auto-generated
    formApis: {},

    // list of actions that can be applied on fields
    actions: actions,

    // manual list of action names and their negative's name
    // for those actions whose names do not apply to negate-rules
    actionNegatives: {
      // 'abcDoSomething': 'xyzUndoSomething'
    },

    // helper functions to deal with different markup structures
    helper: helper,

    // evaluations on single fields
    evaluations: evaluations,

    // default evaluation results for non-existent fields
    evaluationDefaults: evaluationDefaults
  }
};
