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

            if(!options.dataManager)
            {
                throw new Error("Dashboard Charts Container requires a data manager");
            }

            this.dataManager = options.dataManager;

            this.collection = new SettingsSubCollection(null, { 
                sourceModel: this.model,
                sourceKey: "pods",
                comparator: "index",
                model: dashboardChartBuilder.buildChartModel,
                modelOptions: {
                    dataManager: this.dataManager
                }
            });

            this.packeryCollectionView = new PackeryCollectionView({
                itemView: dashboardChartBuilder.buildChartView,
                collection: this.collection,
                itemViewOptions: { dataManager: this.dataManager }
            });

            this.listenTo(this.packeryCollectionView, "reorder", _.bind(this._onReorderCharts, this));
            this.on("show", _.bind(this._showPackeryCollectionView, this));
            this.listenTo(this.collection, "remove", _.bind(this._onRemoveChart, this));
            this.listenTo(this.packeryCollectionView, "itemview:popIn", _.bind(this.packeryCollectionView.enablePackeryResize, this.packeryCollectionView));
            this.listenTo(this.packeryCollectionView, "itemview:popOut", _.bind(this.packeryCollectionView.disablePackeryResize, this.packeryCollectionView));
        },

        onDashboardDatesChange: function()
        {
            this.collection.each(function(model)
            {
                model.trigger("dashboardDatesChange");
            });
        },

        onDashboardRefresh: function()
        {
            this.dataManager.forceReset();
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
