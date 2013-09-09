define(
[
],
function(
)
{
    var FormUtility = {
        applyValuesToForm: function($form, model, options)
        {
            options = options || {};

            FormUtility._processFields($form, function(key, $el)
            {
                var value = model.get(key);
                var type = $el.attr("type");
                var format = $el.data("format");

                if(format === "date")
                {
                    value = moment(value) ? moment(value).format("L") : "";
                }
                else if(options.formatters && options.formatters.hasOwnProperty(format))
                {
                    value = options.formatters[format](value);
                }
                else if(format)
                {
                    throw new Error("Unknown field format: " + format);
                }

                if(type === "radio")
                {
                    $el.val([value]);
                }
                else if(type === "checkbox")
                {
                    // assumes checkbox values are always boolean
                    $el.prop("checked", value ? true : false);
                }
                else
                {
                    $el.val(String(value));
                }

                if($el.is("select"))
                {
                    // Add an empty or Unknown entry if needed
                    var valueAsString = value === undefined || value === null ? "" : value.toString();
                    if($el.val() !== valueAsString)
                    {
                        var text = value ? "Unknown" : "";
                        var $option = $("<option />").attr('value', value).text(text);
                        $el.prepend($option).val(value);
                    }
                }

            }, options);
        },

        applyValuesToModel: function($form, model, options)
        {
            var formValues = {};

             FormUtility._processFields($form, function(key, $el, $formElements)
            {
                var value = "";
                var type = $el.attr("type");

                if(type === "radio")
                {
                    var checkedRadioFilter = "input[type=radio][name=" + key + "]:checked";
                    var $checkedRadio = $formElements.filter(checkedRadioFilter);
                    if($checkedRadio.length)
                    {
                        value = $checkedRadio.val();
                    }
                }
                else if(type === "checkbox")
                {
                    if($el.is(":checked"))
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
                    value = $el.val();
                }

                formValues[key] = value;

            }, options);

            model.set(formValues);
        },

        _processFields: function($form, callback, options)
        {
            var $formElements = FormUtility._findFormFields($form, options ? options.filterSelector : null);

            $formElements.each(function(i, el)
            {
                var $el = $(el);
                var key = $el.attr("name");

                if (key)
                {
                    callback(key, $el, $formElements);
                }
            });
        },

        _findFormFields: function($form, filterSelector)
        {
            var $formElements = $form.find("input, select, textarea");
            if(filterSelector)
            {
                $formElements = $formElements.filter(filterSelector);
            }
            return $formElements;
        }
    };

    return FormUtility;
});


