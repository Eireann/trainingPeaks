define(
[
    "underscore",
    "TP",
    "hbs!quickview/metric/templates/metricQVBarTemplate"
],
function (
    _,
    TP,
    metricQVBarTemplate
)
{

    var MetricQVBarView = TP.ItemView.extend(
    {
        className: "metricQVBarView",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: metricQVBarTemplate
        },

        events:
        {
        },

        // No render on change
        modelEvents: {},

    });

    return MetricQVBarView;

});

