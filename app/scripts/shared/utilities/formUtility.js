define(
[
],
function(
)
{
    var FormUtility = {
        applyValuesToForm: function($form, model, options)
        {
            FormUtility._processFields($form, function(key, $el)
            {
                var value = model.get(key);
                var type = $el.attr("type");
                var format = $el.data("format");

                if(format === "date")
                {
                    value = moment(value) ? moment(value).format("L") : "";
                }
                else if(format)
                {
                    throw new Error("Unknown field format: " + format);
                }

                if(type === "radio")
                {
                    $el.val([String(value)]);
                }
                else if(type === "checkbox")
                {
                    $el.prop("checked", String(value) === String($el.val()));
                }
                else
                {
                    $el.val(String(value));
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
                        value = $el.val();
                    }
                }
                else
                {
                    value = $el.val();
                }

                // fix booleans
                if(value.toLowerCase() === "true")
                {
                    value = true;
                }
                else if(value.toLowerCase() === "false")
                {
                    value = false;
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


