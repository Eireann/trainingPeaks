define(
[
    "TP",
    "hbs!templates/views/quickView/quickViewExpandedView"
],
function (
    TP,
    expandedViewTemplate)
{

    var expandedViewBase =
    {
        className: "summary",

        template:
        {
            type: "handlebars",
            template: expandedViewTemplate
        }
    };

    return TP.ItemView.extend(expandedViewBase);

});