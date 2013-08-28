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
                    value = [value];
                }

                if(type === "checkbox")
                {
                    $el.prop("checked", value ? true : false);
                }
                else
                {
                    $el.val(value);
                }

            }, options);
        },

        applyValuesToModel: function($form, model, options)
        {
            
        },

        _processFields: function($form, callback, options)
        {
            var $formElements = $form.find("input, select, textarea");

            if(options && options.filterSelector)
            {
                $formElements = $formElements.filter(options.filterSelector);
            }

            $formElements.each(function(i, el)
            {
                var $el = $(el);
                var key = $el.attr("name");

                if (key)
                {
                    callback(key, $el);
                }
            });
        }
    };

    return FormUtility;
});


