define(
[
    "underscore",
    "jqueryui/draggable",
    "packery",
    "gridster",
    "TP",
    "framework/settingsSubCollection",
    "./dashboardChartBuilder",
    "views/pageContainer/primaryContainerView",
    "views/packeryCollectionView",
    "hbs!templates/views/dashboard/dashboardChartsContainer"
],
function(
    _,
    jqueryDraggable,
    packery,
    gridster,
    TP,
    SettingsSubCollection,
    dashboardChartBuilder,
    PrimaryContainerView,
    PackeryCollectionView,
    dashboardContainerTemplate
    )
{
    var DashboardView = PrimaryContainerView.extend({
        template:
        {
            type: "handlebars",
            template: dashboardContainerTemplate
        },

        regions: {
            "chartsRegion": ".chartsRegion"
        },

        initialize: function(options)
        {
            DashboardView.__super__.initialize.apply(this, arguments);

            if(!this.model)
            {
                this.model = theMarsApp.user;
            }

            this.collection = new SettingsSubCollection(null, { 
                sourceModel: theMarsApp.user,
                sourceKey: "settings.dashboard.pods",
                comparator: "index"
            });

            this.packeryCollectionView = new PackeryCollectionView({
                itemView: dashboardChartBuilder.buildChartView,
                collection: this.collection
            });

            this.listenTo(this.packeryCollectionView, "reorder", _.bind(this._onReorderCharts, this));
            this.on("show", _.bind(this._showPackeryCollectionView, this));
            this.listenTo(this.collection, "remove", _.bind(this._onRemoveChart, this));
        },

        onDashboardDatesChange: function()
        {
            this.collection.each(function(model)
            {
                model.trigger("dashboardDatesChange");
            });
        },

        _showPackeryCollectionView: function()
        {
            this.chartsRegion.show(this.packeryCollectionView);
        },

        _onRemoveChart: function()
        {
            this.packeryCollectionView.layout();
        },

        _onReorderCharts: function()
        {
            this.collection.sort();
            this._saveSettings();
        },

        _saveSettings: function()
        {
            theMarsApp.user.save();
        }

    });

    return DashboardView;
});
