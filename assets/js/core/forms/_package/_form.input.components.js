'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Datepicker = require('Datepicker');

var _Datepicker2 = _interopRequireDefault(_Datepicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// imports
var $window = require('utils/cacheables-singleton').$window;
var NumericStepper = require('ui/form/numericstepper/numericstepper');


// ============================================================================================================
// =============== FORM INPUT COMPONENT : CLASS ===============================================================
// ============================================================================================================
/**
 * The FormInputComponent class is attached to every FormInput (FormInput.component) to provide extended and/or
 * enhanced functionality such as DatePickers, Custom Selects, etc. By doing it this way, we can attach the
 * component instance directly to the FormInput, allowing us to also access the component APIs. For example,
 * Form.getInput(...).components.datepicker.setMonth(...)
 *
 * Please note, it is really only possible (or practical) for at most one component per FormInput. You wouldn't
 * really ever have a custom dropdown that is also a datepicker, would you? Because of this, you should expect
 * (at most) only one property to be non-null.
 *
 * @constructor
 * @access public
 * @param {jQuery} $input - A jQuery object representing the input, select, etc to attach to.
 */
var FormInputComponents = function FormInputComponents($input) {
	this.datepicker = this._createDatePicker($input);
	this.jcfselect = this._createSelect($input);
	this.numericstepper = this._createNumericStepper($input);
};

FormInputComponents.prototype = {
	/**
  * Determines if this input requires a Pikaday component and creates one when necessary. Please note, we
  * are using the Pikaday-Responsive component which is built ontop of Pikaday. Pikaday-Responsive is smart
  * enough to give us the native datepicker on mobile devices when a native datepicker is supported. This
  * fixes a number of issues – most important, it fixes an iOS issue when a datepicker (calendar) is within
  * a position:fixed element. When an input is in :focus, the keyboard pushes the fixed element up and in
  * some instances hides the calendar entirely below the keyboard. Pikaday-Responsive fixes this issue by
  * eliminating the calendar UI, and provides the nicer native UI instead...basically using the available
  * real estate more appropriately.
  * @access private
  * @param {jQuery} $input - A jQuery object representing the input, select, etc to attach to.
  * @returns {Pikaday} - A Pikaday instance if applicable, null if not.
  */
	_createDatePicker: function _createDatePicker($input) {
		var $component = $input.parent('.form-control-group--date').first();
		var placeholder = $input.attr('placeholder') || 'Select a Date';

		if ($component.length > 0) {
			var obj = pikadayResponsive($input[0], {
				placeholder: placeholder,
				format: 'MM/DD/YYYY',
				outputFormat: 'YYYY-MM-DD',
				classes: 'form-control',
				pikadayOptions: {
					bound: true,
					ariaLabel: placeholder + ' Selector',
					keyboardInput: true,
					minDate: new Date(),
					onOpen: function onOpen() {
						var self = this;
						$window.on('resize.datepicker', function () {
							self.adjustPosition();
						});
					},
					onClose: function onClose() {
						$window.off('resize.datepicker');
					}
				}
			});
			// even though we are creating a Pikaday-Responsive, we still want to expose the actual Pikaday
			// instance API via this.datepicker. This allows us to do things like update postion or sync values.
			return obj.pikaday;

			/* Note: This commented-out section is how to instantiate Pikaday without Pikaday-Responsive. You
      can see that the below options object is what we are applying to the pikadayOptions property above
      when using Pikaday-Responsive. We are leaving this here purely for reference.
   return new Pikaday({
   	field: $input[0],
   	format: "L",
   	minDate: new Date(),
   	onOpen: function(){
   		var self = this;
   		$window.on("resize.datepicker", function(){
   			self.adjustPosition();
   		});
   	},
   	onClose: function(){
   		$window.off("resize.datepicker");
   	}
   });
   */
		}
		return null;
	},

	/**
  * Determines if this input requires a JCF Select component and creates one when necessary. Please note, we
  * have to explicitly tell JCF if its a mobile device to fix a bug on desktop Windows browsers that support
  * touch events (ie...Chrome) – otherwise, it will automatically set `wrapNative` to true and render an
  * unstyled and partially useable component.
  * @access private
  * @param {jQuery} $input - A jQuery object representing the input, select, etc to attach to.
  * @returns {JCF} - A JCF instance if applicable, null if not.
  */
	_createSelect: function _createSelect($input) {
		if ($input.is('select')) {
			jcf.replace($input[0], 'Select', {
				wrapNative: false,
				isMobileDevice: Modernizr.maybemobile
			});
			return jcf.getInstance($input[0]);
		}
		return null;
	},

	_createNumericStepper: function _createNumericStepper($input) {
		if ($input.hasClass('numeric-stepper__input')) {
			return new NumericStepper($input[0]);
		}
		return null;
	}
};

// exports: class
module.exports = FormInputComponents;