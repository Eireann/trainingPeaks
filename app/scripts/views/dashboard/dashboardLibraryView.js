define(
[
    "TP",
    "views/pageContainer/libraryContainerView",
    "views/dashboard/dashboardChartsLibraryView",
    "models/dashboard/availableChartsCollection",
    "hbs!templates/views/dashboard/dashboardLibraryView"
],
function(
    TP,
    LibraryContainerView,
    DashboardChartsLibraryView,
    AvailableChartsCollection,
    dashboardLibraryViewTemplate)
{
    return LibraryContainerView.extend(
    {
        template:
        {
            type: "handlebars",
            template: dashboardLibraryViewTemplate
        },

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, options);

            this.collections =
            {
                charts: new AvailableChartsCollection()
            };
        },

        viewConstructors:
        {
            "chartsLibrary": DashboardChartsLibraryView
        },

        buildView: function(libraryName, options)
        {
            return new this.viewConstructors[libraryName](
            {
                collection: this.collections.charts
            });
        }
    });
});
