define(
[
    "underscore",
    "TP",
    "shared/views/tomahawkView",
    "hbs!expando/templates/addExpandoPodTemplate"
],
function(
    _,
    TP,
    TomahawkView,
    addExpandoPodTemplate
)
{
    var AddExpandoPodView = TomahawkView.extend(
    {

        className: "addExpandoPod tomahawk",
        template:
        {
            type: "handlebars",
            template: addExpandoPodTemplate
        }

    });

    return AddExpandoPodView;

});
