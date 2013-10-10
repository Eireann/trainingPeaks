define(
[
    "setImmediate",
    "TP",
    "views/packeryCollectionView",
    "utilities/charting/dataParser",
    "layouts/expandoLayout",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/statsView",
    "views/expando/lapsView",
    "views/expando/chartsView",
    "views/expando/mapAndGraphResizerView",
    "views/workout/lapsSplitsView",
    "expando/expandoPodBuilder",
    "expando/models/expandoStateModel"
],
function(
    setImmediate,
    TP,
    PackeryCollectionView,
    DataParser,
    ExpandoLayout,
    GraphView,
    MapView,
    StatsView,
    LapsView,
    ChartsView,
    MapAndGraphResizerView,
    LapsSplitsView,
    expandoPodBuilder,
    ExpandoStateModel
)
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
            this.workoutModel = options.workoutModel;
            this.workoutDetailsModel = options.workoutDetailsModel;
            this.prefetchConfig = options.prefetchConfig;

            this.layout = new ExpandoLayout();
            this.layout.on("show", this.show, this);
            this.layout.on("close", this.onLayoutClose, this);
            this.views = {};

            this.dataParser = new DataParser();
            _.bindAll(this, "onModelFetched");
        },

        onLayoutClose: function()
        {
            this.closeViews();
        },

        show: function()
        {
            if (this.layout.isClosed)
            {
                return;
            }

            this.closeViews();
            this.preFetchDetailData();

            var stateModel = new ExpandoStateModel();

            this.views.statsView = new StatsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise, stateModel: stateModel });
            this.views.lapsView = new LapsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise, stateModel: stateModel });

            var podsCollection = new TP.Collection(
            [{
                podType: 1 // Map
            }, {
                podType: 2 // Graph
            }, {
                podType: 3 // Laps & Splits
            }, {
                podType: 4, // Time In Zones
                variant: 1, // Heart Rate
            }, {
                podType: 5, // Peaks
                variant: 1, // Heart Rate
            }, {
                podType: 4, // Time In Zones
                variant: 2, // Power
            }, {
                podType: 5, // Peaks
                variant: 2, // Power
            }, {
                podType: 4, // Time In Zones
                variant: 3, // Speed
            }, {
                podType: 5, // Peaks
                variant: 3, // Speed
            }]);

            var data =
            {
                workout: this.model,
                detailDataPromise: this.prefetchConfig.detailDataPromise,
                dataParser: this.dataParser,
                stateModel: stateModel
            };

            var $sizer = $("<div class='sizer'></div>");

            this.views.packeryView = new PackeryCollectionView({
                itemView: expandoPodBuilder.buildView,
                collection: podsCollection,
                itemViewOptions: { data: data },
                packery:
                {
                    columnWidth: $sizer[0],
                    rowHeight: $sizer[0],
                    gutter: 10
                },
                resizable: true
            });

            this.layout.$el.addClass("waiting");

            this.watchForModelChanges();
            this.watchForWindowResize();

            this.watchForViewEvents();

            this.handleDetailDataPromise();
        },

        handleDetailDataPromise: function()
        {

            var self = this;
            setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });

            // if we don't have a workout, just resolve the deferred to let everything render
            if(!this.model.get("workoutId"))
                this.prefetchConfig.detailDataPromise.resolve();

        },

        onModelFetched: function()
        {
            this.layout.$el.removeClass("waiting");

            var self = this;

            var flatSamples = this.model.get("detailData").get("flatSamples");
            this.dataParser.loadData(flatSamples);

            this.showMapAndGraph();

            // use some setImmediate's to allow everything to paint nicely
            this.layout.statsRegion.show(this.views.statsView);
            this.layout.lapsRegion.show(this.views.lapsView);

            setImmediate(function()
            {
                self.layout.packeryRegion.show(self.views.packeryView);
                self.onViewResize();
            });
        },

        onSensorDataChange: function()
        {
            var flatSamples = this.model.get("detailData").get("flatSamples");
            this.dataParser.loadData(flatSamples);
            this.showMapAndGraph();

            var self = this;
            setImmediate(function()
            {
                self.onViewResize();
            });
 
        },

        showMapAndGraph: function()
        {

            var self = this,
                canShowGraph = this.model.get("detailData").hasSamples(),
                canShowMap = this.dataParser.hasLatLongData;

            if (canShowMap)
            {
                this.layout.showMap();
                setImmediate(function()
                {
                    self.layout.mapRegion.show(self.views.mapView);
                });
            } else
            {
                this.layout.hideMap();
            }

            if (canShowGraph)
            {
                this.layout.showGraph();

                setImmediate(function()
                {
                    self.layout.graphRegion.show(self.views.graphView);
                    self.expand();
                });
                
            } else
            {
                this.layout.hideGraph();
            }

            if (canShowGraph && canShowMap)
            {
                setImmediate(function()
                {
                    self.layout.mapAndGraphResizerRegion.show(self.views.mapAndGraphResizerView);
                });
            }
        },

        preFetchDetailData: function()
        {
            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").createPromise();
            }
        },

        collapse: function()
        {
            this.disableViewsResize = true;
            this.views.graphView.trigger("controller:expandCollapse", "collapse");
            this.layout.$el.parent().hide();
        },
        expand: function()
        {
            this.disableViewsResize = false;
            if (this.views.graphView)
            {
                this.views.graphView.trigger("controller:expandCollapse", "expand");
            }
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
            //TODO Make sure we stop all deferreds at this point, they could prevent thew view from
            //TODO being properly disposed. Further, let's make sure we are properly closing this controller
            //TODO wherever it might get closed.
            if(this.prefetchCongig && this.prefetchConfig.detailDataPromise)
                this.prefetchConfig.detailDataPromise.reject();

            this.stopWatchingModelChanges();

            this.layout.off("show", this.show, this);

        },

        watchForModelChanges: function()
        {
            this.model.on("deviceFileUploaded", this.fetchDetailData, this);
            this.model.get("detailData").on("changeSensorData", this.onSensorDataChange, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        fetchDetailData: function()
        {
            if (this.model.get("workoutId"))
                this.model.get("detailData").fetch();
        },

        stopWatchingModelChanges: function()
        {
            this.model.off("deviceFileUploaded", this.fetchDetailData, this);
            this.model.get("detailData").off("changeSensorData", this.onSensorDataChange, this);
        },

        watchForViewEvents: function()
        {
            _.each(this.views, function(view, key)
            {
                view.on("itemview:resize", this.onViewResize, this);
                view.on("itemview:resizerDrag", this.onResizerDrag, this);
                view.on("itemview:requestClose", this.onRequestViewClose, this);
            }, this);
            this.on("close", this.stopWatchingViewEvents, this);

        },
        stopWatchingViewEvents: function()
        {
            _.each(this.views, function(view, key)
            {
                view.off("itemview:resizerDrag", this.onResizerDrag, this);
                view.off("itemview:requestClose", this.onRequestViewClose, this);
                view.on("resize", this.onViewResize, this);
            }, this);

        },
        onRequestViewClose: function(view)
        {
            view.close();
        },
        onResizerDrag: function(top)
        {
            // before and during proportion change
            // set the height offsets caused by dragging
            var offsetRatio = top/this.layout.$el.parent().height();
            this.views.mapView.stashHeight(offsetRatio);
            this.views.graphView.stashHeight(offsetRatio);
            this.views.mapAndGraphResizerView.setTop(offsetRatio);
            this.onViewResize();
        },

        watchForWindowResize: function()
        {
            _.bindAll(this, "onViewResize");
            $(window).on("resize.expando", this.onViewResize);
            this.on("close", this.stopWatchingWindowResize, this);
        },

        stopWatchingWindowResize: function()
        {
            $(window).off("resize.expando", this.onViewResize);
        },

        onViewResize: function()
        {
            if (this.disableViewsResize)
            {
                return;
            }

            _.each(this.views, function(view)
            {
                view.trigger("controller:resize");
            }, this);

            this.views.packeryView.layout();
        }
    });
});
