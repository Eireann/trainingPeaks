define(
[
    "jquery",
    "underscore",
    "moment",
    "TP"
],
function(
    $,
    _,
    moment,
    TP
)
{
    var FormUtility = {

        formatValue: function(value, format, options)
        {
            var match;
            if(format === "date")
            {
                value = value && moment(value).isValid() ? TP.utils.datetime.format(value) : "";
            }
            else if(format === "number")
            {
                value = Number(value || 0).toString();
            }
            else if(options && options.formatters && options.formatters.hasOwnProperty(format))
            {
                value = options.formatters[format](value, options.formatterOptions);
            }
            else if(format && (match = format.match(/^units:(.*)/)))
            {
                value = TP.utils.conversion.formatUnitsValue(match[1], value, options);
            }
            else if(format)
            {
                throw new Error("Unknown field format: " + format);
            }

            return value || "";
        },

        parseValue: function(value, format, options)
        {
            var match;
            if(format === "number")
            {
                value = Number(value);
            }
            else if(format === "date")
            {
                // parse the input based on user preference,
                // make sure the model is in consistent format regardless of user preference
                if(value)
                {
                    var parsedDate = TP.utils.datetime.parse(value);
                    value = parsedDate ? parsedDate.format("YYYY-MM-DD") : null;
                }
            }
            else if(options && options.parsers && options.parsers.hasOwnProperty(format))
            {
                value = options.parsers[format](value, options.parserOptions);
            }
            else if(format && (match = format.match(/^units:(.*)/)))
            {
                value = TP.utils.conversion.parseUnitsValue(match[1], value, options);
            }
            else if(_.isString(value) && value.trim() === "")
            {
                // empty strings should be nulls in most cases
                value = null;
            }

            return value;
        },

        applyValuesToForm: function($form, model, options)
        {
            options = options || {};

            FormUtility._processFields($form, function(key, $field, $fields)
            {
                FormUtility.applyValueToField(key, $field, $fields, model, options);
            },
            options);
        },

        applyValueToField: function(key, $field, $fields,  model, options)
        {
            var value = model.get(key);
            var type = $field.attr("type");
            var format = $field.data("format");
            value = FormUtility.formatValue(value, format, options);

            if(type === "radio")
            {
                $field.val([value]);
            }
            else if(type === "checkbox")
            {
                // assumes checkbox values are always boolean
                $field.prop("checked", value ? true : false);
            }
            else
            {
                $field.val(String(value));
            }

            if($field.is("select"))
            {
                // Add an empty or Unknown entry if needed
                var valueAsString = value === undefined || value === null ? "" : value.toString();
                if($field.val() !== valueAsString)
                {
                    var text = value ? "Unknown" : "";
                    var $option = $("<option />").attr('value', value).text(text);
                    $field.prepend($option).val(value);
                }
            }

            if(options.trigger)
            {
                $field.trigger("change");
            }
        },

        applyValuesToModel: function($form, model, options)
        {
            var formValues = {};

            FormUtility._processFields($form, function(key, $field, $fields)
            {
                formValues[key] = FormUtility.extractValueFromField(key, $field, $fields, model, options);
            },
            options);

            model.set(formValues);
        },

        extractValueFromField: function(key, $field, $fields, model, options)
        {
            var value = "";
            var type = $field.attr("type");
            var format = $field.data("format");

            if(type === "radio")
            {
                var checkedRadioFilter = "input[type=radio][name='" + key + "']:checked";
                var $checkedRadio = $fields.filter(checkedRadioFilter);
                if($checkedRadio.length)
                {
                    value = $checkedRadio.val();
                }
            }
            else if(type === "checkbox")
            {
                if($field.is(":checked"))
                {
                    value = true;
                }
                else
                {
                    value = false;
                }
            }
            else
            {
                value = $field.val();
            }

            return FormUtility.parseValue(value, format, options);
        },

        bindFormToModel: function($form, model, options)
        {
            FormUtility.applyValuesToForm($form, model, options);
            var filterSelector = options ? options.filterSelector : null;
            $form.on("change", "input, select, textarea", function(event) {
                var $field = $(event.target);

                // Skip fields not matching the filterSelector
                if(filterSelector && !$field.is(filterSelector)) return;

                var $fields = FormUtility._findFormFields($form, options);
                var key = $field.attr("name");
                model.set(key, FormUtility.extractValueFromField(key, $field, $fields, model, options));
                FormUtility.applyValueToField(key, $field, $fields, model, options);
            });
        },

        validate: function($form, options)
        {
            var errors = [];

            FormUtility._processFields($form, function(key, $field, $fields)
            {
                var $label = $('label[for="' + $field.attr("id") + '"]');
                var value = FormUtility.extractValueFromField(key, $field, $fields, undefined, options);

                var isRequired = $field.data("required") !== undefined;
                if(isRequired && !value)
                {
                    errors.push(($field.data("label") || $label.text()) + " is required");
                }
            },
            options);

            return errors;
        },

        _processFields: function($form, callback, options)
        {
            var $fields = FormUtility._findFormFields($form, options);

            $fields.each(function(i, field)
            {
                var $field = $(field);
                var key = $field.attr("name");

                if (key)
                {
                    callback(key, $field, $fields);
                }
            });
        },

        _findFormFields: function($form, options)
        {
            var filterSelector = options ? options.filterSelector : null;
            var $fields = $form.find("input, select, textarea");
            if(filterSelector)
            {
                $fields = $fields.filter(filterSelector);
            }
            return $fields;
        }
    };

    return FormUtility;
});


