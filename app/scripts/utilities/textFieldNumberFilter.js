define(
[
    "underscore"
],
function(_)
{
    var textFieldNumberFilter =
    {

        isNumberKey: function (evt)
        {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 58)
            {
                evt.preventDefault();
            }

            return true;
        }

    };

    return textFieldNumberFilter;
});