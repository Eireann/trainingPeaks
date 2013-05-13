define(
[
    "TP",
    "layouts/expandoLayout",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/statsView",
    "views/expando/lapsView",
    "views/expando/chartsView"
],
function(TP, ExpandoLayout, GraphView, MapView, StatsView, LapsView, ChartsView)
{
    return TP.Controller.extend(
    {
        getLayout: function()
        {
            return this.layout;
        },
        
        initialize: function(options)
        {
            this.model = options.model;
            this.prefetchConfig = options.prefetchConfig;

            this.layout = new ExpandoLayout();
            this.layout.on("show", this.show, this);

            this.views = {};
        },

        show: function()
        {
            this.closeViews();
            this.fetchDetailData();

            this.views.graphView = new GraphView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.mapView = new MapView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.statsView = new StatsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.lapsView = new LapsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.chartsView = new ChartsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });

            this.layout.graphRegion.show(this.views.graphView);
            this.layout.mapRegion.show(this.views.mapView);
            this.layout.statsRegion.show(this.views.statsView);
            this.layout.lapsRegion.show(this.views.lapsView);
            this.layout.chartsRegion.show(this.views.chartsView);
        },

        fetchDetailData: function()
        {
            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").fetch();
            }
        },

        collapse: function()
        {
            this.layout.$el.parent().hide();
        },
        
        closeViews: function()
        {
            _.each(this.views, function(view)
            {
                view.close();
            });
        },
        
        onClose: function()
        {
        }
    });
});