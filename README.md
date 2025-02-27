# form-logic
TYPO3 form logic addon

## Form Scripts

The form script is plain javascript which is added to the page.
The script is executed on `$(document).ready()`.
It is run in a context with a global variable `form`. Here are the possible usages.

### form.id()
Returns the ID of the form.
```javascript
console.log(form.id());
```

### fieldId
The parameter `fieldId` is used all over the place. It is there to target a specific part of the given form. We can hereby mean a specific field (`text-1`) or its wrapping markup (`radiobutton-1`), or even a container (`fieldset-1`).

Furthermore we are always able to target more than one ID: `text-1,checkbox-1`

For radio buttons as well as multicheckbox fields, we can also target specific input elements of those multi-fields by adding their value: `multicheckbox-1:some-value` and we can also target multiple values at once: `multicheckbox-1:some-value:some-other-value`.

Those features can be combined all together: `text-1,multicheckbox-1:x:y,radiobutton-1:a`.

Whenever the parameter `fieldId`is mentioned, those features apply automatically. However, some combinations just do not make any sense and may lead to weird behaviour. For example `form.get('fieldset-1:a:b');` will search for all HTML tags inside the given fieldset with the attribute `value="a"` or `value="b"`, which just doesn't make sense.

Note: For reasons of simplicity, this manual is talking about the `fieldId` mostly as if it would target exactly one form field, even though it could actually be multiple elements.

### fieldId Alias
The form extension is setting the ID of the form and its elements without the possibility to intervene. This is sometimes a bit frustrating, especially if you want to copy the script to another form whose elements may have different IDs.

With an alias you can map your chosen name of a field to its ID and use that name instead of the ID in the following logic.
If the element property `fluidAdditionalAttributes.name` is available and not empty (e.g. introduced by ext:formrelay) the alias of the name field will be set automatically.

Note that the mapped ID has to have the ID of the form as a prefix. We recommend to let an extension (or theme) do the work automatically. The FLUID partial for this work is `FormLogicAliases.html`.
```javascript
form.setAlias(form.getUniqueFieldId('text-2'), 'first_name');
```

The features of the standard `fieldId` are available for aliases as well.
```javascript
form.get('area_of_interest,text-6,last_name')
form.get('area_of_interest:x:y')
form.get('multicheckbox-1:a,area_of_interest:x:y,textarea-3')
```

### form.get(fieldId)
Returns the element (as jQuery object) inside the form with the given ID.
Note: The element is not necessarily the form field itself. It can also be a container (like a grid row element) or a wrapper (like a radiobutton group).
Returns all form fields (as jQuery object) inside the form if the given ID evaluates to `false`.
```javascript
var $fieldsetContainer = form.get('fieldset-1');
$fieldsetContainer.addClass('foobar');

var $radioButtonContainer = form.get('radiobutton-1');
// this container is probably not including the label/legend of the buttons
$radioButtonContainer.addClass('baz');

var $inputElement = form.get('text-1');
$inputElement.prop('disabled', true);

var $allFormFields = form.get();
// do something with all the form fields...
```

### form.getFields(fieldId)
Returns the form field (as jQuery object) inside the form with the given ID.
Note: If the ID belongs to a container, it is returning the form elements within this container instead.
Returns all form fields (as jQuery object) inside the form if the given ID evaluates to `false`.
```javascript
var $formFields = form.getFields('fieldset-1');
$formFields.prop('disabled', true);

var $radioButtons = form.getFields('radiobutton-1');
$radioButtons.prop('readonly', true);

var $allFormFields = form.getFields();
// do something with all the form fields...
```

### form.getFieldWrap(fieldId)
Returns the wrapping markup that belongs to the field (or container) with the given ID.
Useful to hide a field including its label.
```javascript
var $fieldWrap = form.getFieldWrap('text-1');
$fieldWrap.hide();
```

### form.exists(fieldId)
Returns true if a field or container with the given ID exists. Otherwise false.
```javascript
if (form.exists('text-2')) { console.log('foobar'); }
```

### form.val(fieldId)
Returns the current value of the form field with the given ID.
Unchecked checkboxes and radiobuttons return `0`.
```javascript
console.log(form.val('text-1'));
```

### form.val(fieldId, value)
Sets the current value of the form field with the given ID.
For checkboxes and radiobuttons, values which evaluate to `true` mean `checked` and those which evalute to `false` mean `unchecked`.
Note: If you want to check or uncheck a specific radiobutton inside a group, you have to adress it in the the `fieldId`, not in the `value`.
```javascript
form.val('text-1', 'foobar');
form.val('checkbox-1', true);
form.val('checkbox-1', false);

// WRONG: form.val('radiobutton-1', 'a');
// RIGHT:
form.val('radiobutton-1:a', true);

form.val('multicheckbox-1:x:y', true);
```

### <a name="eval"></a>form.eval(fieldId, condition)
Evaluates the fields value with the given ID according to the `condition`.
Possible conditions:
* `true`
* `false`
* `'not-empty'`
* `'empty'`
* `'valid'`
* `'invalid'`
* `'required'`
* `'not-required'`
* `'readonly'`
* `'not-readonly'`
* `'file-extension:COMMASEPARATEDLIST'`
* `'not-file-extension:COMMASEPARATEDLIST'`
* `'value:ANYVALUE'`
* `'ANYVALUE'`
* `'not:ANYVALUE'`
```javascript
if (form.eval('checkbox-1', true)) { console.log('checkbox 1 is checked'); }
if (form.eval('checkbox-1', 'not-empty')) { console.log('checkbox 1 is checked'); }
if (form.eval('checkbox-1', false)) { console.log('checkbox 1 is not checked'); }
if (form.eval('checkbox-1', 'empty')) { console.log('checkbox 1 is not checked'); }
if (form.eval('text-1', 'empty')) { console.log('text 1 is empty'); }
if (form.eval('text-1', 'valid')) { console.log('input of text 1 is valid. e.g. if it is a required field, it is not empty'); }
if (form.eval('text-1', 'not-valid')) { console.log('input of text 1 is not valid. e.g. if it is a required field, it may be empty'); }
if (form.eval('text-1', 'readonly')) { console.log('text 1 is a readonly field'); }
if (form.eval('text-1', 'not-readonly')) { console.log('text 1 is not a readonly field'); }
if (form.eval('text-1', 'required')) { console.log('text 1 is a required field'); }
if (form.eval('text-1', 'not-required')) { console.log('text 1 is not a required field'); }
if (form.eval('text-1', 'field-extension:txt,pdf')) { console.log('file name in text 1 has extension txt or pdf'); }
if (form.eval('text-1', 'not-field-extension:txt,pdf')) { console.log('file name in text 1 either does not have an extension or it is neither txt nor pdf'); }
if (form.eval('text-1', 'foobar')) { console.log('text 1 has the value "foobar"'); }
if (form.eval('text-1', 'not:foobar')) { console.log('text 1 does not have the value "foobar"'); }
if (form.eval('text-1', 'value:not-valid')) { console.log('text 1 has the value "not-valid"'); }
```

### form.on(event, fieldId, callback)
Calls `callback` whenever `event` is triggered on the field with the given ID.
If the ID refers to a container, the event listener is registered for all fields within the container.
```javascript
form.on('change', 'text-1', function(fieldId, value) { console.log('text-1: ' + value) });
form.on('input change', 'fieldset-1', function(fieldId, value) { console.log(fieldId + ': ' + value) });
```

### <a name="actions"></a>form.ACTION(fieldId, ...)
There are quite a lot methods for manipulating form fields:
#### form.enable(fieldId)
Enables the form field.
#### form.disable(fieldId)
Disables the form field.
#### form.show(fieldId)
Shows the wrapping markup of the form field with the give ID.
#### form.hide(fieldId)
Shows the wrapping markup of the form field with the give ID.
```javascript
// hide text-1 if checkbox-1 is not checked
// note: for standard actions like show and hide there is an easier way, which is described later on
form.on('change', 'checkbox-1', function(id, value) {
	if (value) {
		form.show('text-1');
	} else {
		form.hide('text-1');
	}
});
if (form.val('checkbox-1')) {
	form.show('text-1');
} else {
	form.hide('text-1');
}
```
#### form.fadeIn(fieldId)
Let's the wrapping markup of the form field with the give ID fade in.
```javascript
// let fieldset-2 fade in as soon as any field in fieldset-1 changes
form.on('input change', 'fieldset-1', function(id, value) {
	form.fadeIn('fieldset-2');
});
```
#### form.fadeOut(fieldId)
Let's the wrapping markup of the form field with the give ID fade out.
#### form.slideDown(fieldId)
Let's the wrapping markup of the form field with the give ID slide down.
#### form.slideUp(fieldId)
Let's the wrapping markup of the form field with the give ID slide up.
#### form.addClass(fieldId, className)
Adds the given class to the wrapping markup of the form field with the given ID.
#### form.removeClass(fieldId, className)
Removes the given class from the wrapping markup of the form field with the given ID.
#### form.toggleClass(fieldId, className)
Toggles the given class of the wrapping markup of the form field with the given ID.
#### form.collapse(fieldId, action)
Processes an action on the content of the collapsable container with the given ID: `show|hide|toggle`.
#### form.showCollapse(fieldId)
Shows the content of the collapsable container with the given ID.
```javascript
// let collapsable-1 show its content when checkbox-1 is checked for the first time
// note: for standard actions like showCollapse there is an easier way, which is described later on
if (form.val('checkbox-1')) {
	// check if the checkbox is checked initially
	form.showCollapse('collapseable-1', true) // the second argument indicates to skip the animation
} else {
	// listen to the change events
	var once = 0;
	form.on('change', 'checkbox-1', function(id, value) {
		if (value && !once) {
			once = 1;
			form.showCollapse('collapsable-1');
		}
	});
}
```
#### form.hideCollapse(fieldId)
Hides the content of the collapsable container with the given ID.
#### form.toggleCollapse(fieldId)
Toggles the content of the collapsable container with the given ID.
#### form.required(fieldId, action)
Processes an action on the required state of the field with the given ID: `set|unset|toggle` Handles the required attribute as well as the surrounding markup.
Note: This is only happening client-sided. The sever-side validation is not affected.
#### form.setRequired(fieldId)
Sets the required state of the field with the given ID.
#### form.unsetRequired(fieldId)
Unsets the required state of the field with the given ID.
#### form.toggleRequired(fieldId)
Toggles the required state of the field with given ID.
#### form.readonly(fieldId, action)
Processes an action on the readonly state of the field with the given ID: `set|unset|toggle`
#### form.setReadonly(fieldId)
Sets the readonly state of the field with the given ID.
#### form.unsetReadonly(fieldId)
Unsets the readonly state of the field with the given ID.
#### form.toggleReadonly(fieldId)
Toggles the readonly state of the field with the given ID.
#### form.checked(fieldId, action)
Processes an action on the checked state of the (checkbox) field with the given ID: `set|unset|toggle`
#### form.setChecked(fieldId)
Sets the checked state of the (checkbox) field with the given ID.
#### form.unsetChecked(fieldId)
Unsets the checked state of the (checkbox) field with the given ID.
#### form.toggleChecked(fieldId)
Toggles the checked state of the (checkbox) field with the given ID.

### form.if()

Returns a conditioned object for command chains.
It will trigger its commands on any change of the condition evaluation. What is triggered depends on the following chain.
The condition is also initially evaluated once and may trigger the chain according to the evaluation (without a field having changed its value). In that case, an extra parameter skipAnimation is set, to indicate that every show/hide/move should be done immediately.

#### Conditions
There are multiple types of conditions which can be used in the if-statement.

##### .if(condition, fieldId)
The condition is evaluated via the method [`form.eval()`](#eval). Evaluation is triggered whenever the given field changes.
```javascript
form.if('not-empty', 'text-1')
```

##### .if(fnc, fieldId)
The function `fnc` is called to do a custom evaluation. The evaluation is triggered whenever the given field changes.
```javascript
form.if(function(fieldId, fieldValue) { return someEvaluation(); }, 'text-1')
```

##### .if(fnc)
The function `fnc` is called to do a custom evaluation. The evaluation is not triggered automatically. It either has to be triggered manually at a later point, or there need to be other conditions in the chain which trigger an evaluation.
```javascript
form.if(function() { return someEvaluation(); })
```

##### .if(fieldId)
There is no evaluation added, but the evaluation is triggered when the given field changes. Other conditions would need ot be added. Otherwise the command chain will be triggered on every evaluation.
```javascript
form.if('text-1')
```

#### Condition Chaining

Conditions can be concatenated as DNF (disjunctive normal form) by using the following methods.

`.and()`, `.or()`, `.openBracket()`, `.closeBracket()`

Examples:
```javascript
form.if()
  .if('not-empty', 'text-1')
  .or()
  .if('not-empty', 'text-2')

form.if()
  .if('not-empty', 'text-1')
  .or()
  .if('not-empty', 'text-2')
  .and()
  .if('not-empty', 'text-3')

form.if()
  .openBracket()
    .if('not-empty', 'text-1')
    .or()
    .if('not-empty', 'text-2')
  .closeBracket()
  .and()
  .if('not-empty', 'text-3')
```

#### Condition Chaining Shortcuts
In order to avoid long command chains, each junction can be used for the next condition as well.
```javascript
form.if().if('not-empty', 'text-1')
// ==
form.if('not-empty', 'text-1')
```
```javascript
form.if('not-empty', 'text-1').or().if('not-empty', 'text-2')
// ==
form.if('not-empty', 'text-1').or('not-empty', 'text-2')
```
```javascript
form.if('not-empty', 'text-1')
  .and()
  .openBracket()
    .if('not-empty', 'text-2')
    .or()
    .if('not-empty', 'text-3')
  .closeBracket()
// ==
form.if('not-empty', 'text-1')
  .andOpenBracket()
    .if('not-empty', 'text-2')
    .or('not-empty', 'text-3')
  .closeBracket()
// ==
form.if('not-empty', 'text-1')
  .andOpenBracket('not-empty', 'text-2')
    .or('not-empty', 'text-3')
  .closeBracket()
```

Also, all open brackets will be closed automatically when applying a command to the chain:

```javascript
form.if('not-empty', 'text-1')
  .orOpenBracket()
    .if('not-empty', 'text-2')
    .andOpenBracket()
      .if('not-empty', 'text-3')
      .or('not-empty', 'text-4')
    .closeBracket()
  .closeBracket()
  .then(function() {});
// ==
form.if('not-empty', 'text-1')
  .orOpenBracket()
    .if('not-empty', 'text-2')
    .andOpenBracket()
      .if('not-empty', 'text-3')
      .or('not-empty', 'text-4')
  .then(function() {});
```
#### Query Nesting

It is possible to use one if-query as condition in another if-query.
The nested query will be treated as a separate term, enclosed in brackets.

Notice that only the conditions are being evaluated in the parent query, not the resulting actions.
In this example the action `abc()` will not be triggered by the second query.

Also notice that the triggers of the sub query are passed to the parent.
In this example the second action `def()` will also be evaluated when `text-1` or `text-2` changes.

```javascript
var myQuery = form.if('not-empty', 'text-1')
  .and('not-empty', 'text-2')
  .then(function() { abc(); });

form.if('not-empty', 'text-3')
  .or(myQuery)
  .or('not-empty', 'text-4')
  .then(function() { def(); });
```
The equivalent without nesting would be like this:
```javascript
form.if('not-empty', 'text-1')
  .and('not-empty', 'text-2')
  .then(function() { abc(); });

form.if('not-empty', 'text-3')
  .openBracket()
    .if('not-empty', 'text-1')
    .and('not-empty', 'text-2')
  .closeBracket()
  .or('not-empty', 'text-4')
  .then(function() { def(); });
```

#### Commands: Callback Methods

One way of adding commands is to use simple callback methods.

##### .call(callback)
The function `callback` will be called whenever the evaluation changes.
```javascript
form.if('empty', 'text-1').call(function(state) {
	console.log('text-1 is' + (state ? '' : ' not') + ' empty');
});
```

##### .then(callback)
The function `callback` will be called when ever the evaluation changes from `false` to `true`.
```javascript
form.if('empty', 'text-1').then(function() {
	console.log('text-1 is not empty anymore');
});
```

##### .else(callback)
The function `callback` will be called when ever the evaluation changes from `true` to `false`.
```javascript
form.if('empty', 'text-1').else(function() {
	console.log('text-1 is now empty');
});
```

##### .once(callback)
The function `callback` will be called when the evaluation changes from `false` to `true` for the first time.
```javascript
form.if('empty', 'text-1').once(function() {
	console.log('text-1 is not empty for the first time');
});
```

#### Commands: Intelligent Actions

A more comfortable way of adding triggers is to use intelligent actions.
Those [actions](#actions) have to be known to the form object. You can also add a comma-separated list of actions, though you should be careful about actions which need additional parameters since all actions will have the same parameters passed.
As far as possible, it will execute negated actions (show - hide, enable - disable, and so on) if the evaluation does not correspond with the trigger.
Initially the actions will apply their changes without animations.

##### .then(action, fieldId, ...)
Executes the given form `action` whenever the evaluation changes from `false` to `true`.
If the evaluation changes from `true` to `false` it will try to execute the negated action if known.
```javascript
// I will slide up textarea-1 if text-1 is empty and I will also slide it down if not empty
form.if('empty', 'text-1').then('slideUp', 'textarea-1');

// I will add the class baz to radiobutton-1 if singleselect-1 is set to foobar, and i will also remove the class otherwise
form.if('foobar', 'singleselect-1').then('addClass', 'radiobutton-1', 'baz');
```

#### .onlyThen(action, fieldId, ...)
This action does the same as `then` but it will not try to execute the negated action if the evaluation does not match.

##### .else(action, fieldId, ...)
Executes the given form `action` whenever the evaluation changes from `true` to `false`.
If the evaluation changes from `false` to `true` it will try to execute the negated action if known.
```javascript
// I will slide up textarea-1 and disable it if text-1 is not empty and I will also slide it down and enable if empty
form.if('empty', 'text-1').else('slideUp,disable', 'textarea-1');

// I will add the class baz to radiobutton-1 if singleselect-1 is not set to foobar, and i will also remove the class otherwise
form.if('foobar', 'singleselect-1').else('addClass', 'radiobutton-1', 'baz');
```

#### .onlyElse(action, fieldId, ...)
This action does the same as `else` but it will not try to execute the negated action if the evaluation does not match.

##### .once(action, fieldId, ...)
Executes the given form `action` when the evaluation changes from `false` to `true` for the first time.
If the evaluation changes from `true` to `false` it will try to execute the negated action if known and if the evaluation hasn't changed from `false` to `true`, yet.
```javascript
// if text-1 is not empty initially, this will not do anything
// if text-1 is empty initially, this will hide textarea-1 and will slide it down once when text-1 is not empty anymore
//    it will not slide up again afterwards
form.if('not-empty', 'text-1').once('slideDown', 'textarea-1');
```

##### .then()
Stores the decision to execute any action on the form object directly by calling it on the query object.

```javascript
form.if('not-empty', 'text-1').then().slideUp('textarea-1').addClass('checkbox-1', 'foo');
// equals
form.if('not-empty', 'text-1').then('slideUp', 'textarea-1').then('addClass', 'checkbox-1', 'foo');
```

The stored decision defaults to this behaviour, so you can skip right to the actions unless you used an `.else()` before.

```javascript
form.if('not-empty', 'text-1').slideUp('textarea-1').addClass('checkbox-1', 'foo');
// equals
form.if('not-empty', 'text-1').then().slideUp('textarea-1').addClass('checkbox-1', 'foo');
```

##### .else()
Stored the decision to execute any action on the form object directly, but negated, by calling it on the query object.

```javascript
form.if('not-empty', 'text-1').else().slideUp('textarea-1').addClass('checkbox-1', 'foo');
// equals
form.if('not-empty', 'text-1').else('slideUp', 'textarea-1').else('addClass', 'checkbox-1', 'foo');
```

The methods `.then()` and `.else()` can be combined in any order and with any signature.

```javascript
form.if('not-empty', 'text-1')
  .then()
  .slideUp('textarea-1')                 // not negated
  .slideDown('textarea-2')               // not negated
  .else('addClass', 'textarea-3', 'foo') // negated
  .addClass('textarea-4', 'bar')         // negated
  .then(function() { /* ... */ })        // called only if the evaluation is true
  .hide('textarea-6')                    // not negated
```

### Signature

```
IF = form.if CONDITION COMMAND*
CONDITION = .if|(.openBracket CONDITION .closeBracket) NEXT_CONDITION?
NEXT_CONDITION = (.or|.and) CONDITION
COMMAND = .call|.then|.else|.once|.onlyThen|.onlyElse|ACTION
ACTION = any action provided by the form object
```
