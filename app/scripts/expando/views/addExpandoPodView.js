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
    var AddExpandoPodView = TP.CompositeView.extend(
    {

        className: "addExpandoPod",
        template:
        {
            type: "handlebars",
            template: addExpandoPodTemplate
        }

    });

    TomahawkView.wrap(AddExpandoPodView);

    return AddExpandoPodView;

});
