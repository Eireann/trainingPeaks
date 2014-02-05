define(
[
    "underscore"
],
function(_)
{

    var multilineEllipsis = function(text, maxLength, ellipsis)
    {
        if (typeof maxLength !== "undefined" && text.length > maxLength)
        {
            if(_.isUndefined(ellipsis))
            {
                ellipsis = "...";
            }
            text = text.substr(0, maxLength - 3) + ellipsis;
        }
        return text;
    };

    return multilineEllipsis;
});