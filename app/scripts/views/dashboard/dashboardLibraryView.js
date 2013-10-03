define(
[
    "underscore",
    "TP",
    "views/pageContainer/libraryContainerView",
    "views/dashboard/dashboardChartsLibraryView",
    "models/dashboard/availableChartsCollection",
    "hbs!templates/views/dashboard/dashboardLibraryView"
],
function(
    _,
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

            if(options && options.collections)
            {
                this.collections = options.collections;
            }
            else
            {
                this.collections = 
                {
                    charts: new AvailableChartsCollection([], { featureAuthorizer: theMarsApp.featureAuthorizer })
                };
            }

            this.on("user:loaded", _.bind(this.collections.charts.addAllAvailableCharts, this.collections.charts));
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
