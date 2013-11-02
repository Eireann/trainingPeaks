define(
[
    "underscore",
    "TP",
    "shared/views/tomahawkView",
    "expando/views/expandoPodTileView",
    "expando/models/availableExpandoPodsCollection",
    "hbs!expando/templates/addExpandoPodTemplate"
],
function(
    _,
    TP,
    TomahawkView,
    ExpandoPodTileView,
    AvailableExpandoPodsCollection,
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
        },

        events:
        {
            "dragstart .podTile": "close"
        },

        itemView: ExpandoPodTileView,
        itemViewContainer: ".availablePods",

        collection: new AvailableExpandoPodsCollection()

    });

    TomahawkView.wrap(AddExpandoPodView);

    return AddExpandoPodView;

});
