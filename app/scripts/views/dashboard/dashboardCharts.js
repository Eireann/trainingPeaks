define(
[
    "TP",
    "views/pageContainer/primaryContainerView",
    "hbs!templates/views/dashboard/dashboardCharts"
],
function(TP,
    PrimaryContainerView,
    dashboardTemplate)
{
    var DashboardView =
    {
        template:
        {
            type: "handlebars",
            template: dashboardTemplate
        },

        initialize: function()
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
        }

    };

    return PrimaryContainerView.extend(DashboardView);
});