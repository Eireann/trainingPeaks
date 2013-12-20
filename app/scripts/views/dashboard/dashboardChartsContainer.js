define(
[
    "underscore",
    "jqueryui/draggable",
    "packery",
    "TP",
    "framework/filteredSubCollection",
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
    TP,
    FilteredSubCollection,
    SettingsSubCollection,
    dashboardChartBuilder,
    PrimaryContainerView,
    PackeryCollectionView,
    dashboardContainerTemplate
)
{
    function userCanUsePod(chartModel)
    {
        var featureAttributes = { podTypeId: chartModel.get("chartType") };
        return theMarsApp.featureAuthorizer.canAccessFeature(
            theMarsApp.featureAuthorizer.features.UsePod,
            featureAttributes
        );
    }

    var DashboardView = PrimaryContainerView.extend(
    {

        attributes: { style: "height: 100%;" },

        template:
        {
            type: "handlebars",
            template: dashboardContainerTemplate
        },

        regions:
        {
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

            this.collection = new SettingsSubCollection(null,
            { 
                sourceModel: this.model,
                sourceKey: "pods",
                comparator: "index",
                model: dashboardChartBuilder.buildChartModel,
                modelOptions: 
                {
                    dataManager: this.dataManager
                }
            });

            this.on("close", this.collection.releaseSourceModel, this.collection);

            this.filteredCollection = new FilteredSubCollection(null,
            {
                sourceCollection: this.collection,
                filterFunction: userCanUsePod
            });

            this.packeryCollectionView = new PackeryCollectionView(
            {
                itemView: dashboardChartBuilder.buildChartView,
                collection: this.filteredCollection,
                itemViewOptions: { dataManager: this.dataManager },
                droppable: { enabled: true }
            });

            this.listenTo(this.packeryCollectionView, "reorder", _.bind(this._onReorderCharts, this));
            this.on("user:loaded", _.bind(this._showPackeryCollectionView, this));
            this.listenTo(this.collection, "remove", _.bind(this._onRemoveChart, this));
            this.listenTo(this.packeryCollectionView, "itemview:popIn", _.bind(this.packeryCollectionView.enablePackeryResize, this.packeryCollectionView));
            this.listenTo(this.packeryCollectionView, "itemview:popOut", _.bind(this.packeryCollectionView.disablePackeryResize, this.packeryCollectionView));
        },

        onDashboardDatesChange: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "dashboard", "eventAction": "setGlobalDate", "eventLabel": "" });

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
            theMarsApp.user.getDashboardSettings().save();
        }

    });

    return DashboardView;
});
