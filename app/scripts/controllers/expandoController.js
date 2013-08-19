define(
[
    "setImmediate",
    "TP",
    "utilities/charting/dataParser",
    "layouts/expandoLayout",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/statsView",
    "views/expando/lapsView",
    "views/expando/chartsView",
    "views/expando/mapAndGraphResizerView",
    "views/workout/lapsSplitsView"
],
function(setImmediate, TP, DataParser, ExpandoLayout, GraphView, MapView, StatsView, LapsView, ChartsView, MapAndGraphResizerView, LapsSplitsView)
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

            this.views.graphView = new GraphView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise, dataParser: this.dataParser });
            this.views.mapView = new MapView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise, dataParser: this.dataParser });
            this.views.statsView = new StatsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.lapsView = new LapsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.chartsView = new ChartsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.mapAndGraphResizerView = new MapAndGraphResizerView({model: this.model});
            this.views.lapsSplitsView = new LapsSplitsView({model: this.model});

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

            // use some setImmediate's to allow everything to paint nicely
            this.layout.statsRegion.show(this.views.statsView);
            this.layout.lapsRegion.show(this.views.lapsView);

            var self = this;

            var flatSamples = this.model.get("detailData").get("flatSamples");
            this.dataParser.loadData(flatSamples);

            this.showMapAndGraph();

            setImmediate(function()
            {
                self.layout.chartsRegion.show(self.views.chartsView);
                self.layout.lapsSplitsRegion.show(self.views.lapsSplitsView);
            });

            setImmediate(function()
            {
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

            if (canShowGraph)
            {
                this.layout.showGraph();

                setImmediate(function()
                {
                    self.layout.graphRegion.show(self.views.graphView);
                });
                
            } else
            {
                this.layout.hideGraph();
            }

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
                view.on("rangeselected", this.onRangeSelected, this);
                view.on("unselectall", this.onUnSelectAll, this);
                view.on("graphhover", this.onGraphHover, this);
                view.on("graphleave", this.onGraphLeave, this);
                view.on("resize", this.onViewResize, this);
                view.on("resizerDrag", this.onResizerDrag, this);
            }, this);
            this.on("close", this.stopWatchingViewEvents, this);

        },
        stopWatchingViewEvents: function()
        {
            _.each(this.views, function(view, key)
            {
                view.off("rangeselected", this.onRangeSelected, this);
                view.off("unselectall", this.onUnSelectAll, this);
                view.off("graphhover", this.onGraphHover, this);
                view.off("graphleave", this.onGraphLeave, this);
                view.off("resizerDrag", this.onResizerDrag, this);
                view.on("resize", this.onViewResize, this);
            }, this);

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

        onRangeSelected: function (workoutStatsForRange, options, triggeringView)
        {

            _.each(this.views, function(view, key)
            {
                view.trigger("controller:rangeselected", workoutStatsForRange, options, triggeringView);
            }, this);

            if (!workoutStatsForRange.hasLoaded)
            {
                workoutStatsForRange.fetch().done(function()
                {
                    workoutStatsForRange.hasLoaded = true;
                    // don't retrigger the views, the views can decide if they want to listen or not
                });
            }
        },
        
        onGraphHover: function (options)
        {
            _.each(this.views, function(view, key)
            {
                view.trigger("controller:graphhover", options);
            }, this);
        },

        onGraphLeave: function()
        {
            _.each(this.views, function (view, key)
            {
                view.trigger("controller:graphleave");
            }, this);
        },
        
        onUnSelectAll: function()
        {
            _.each(this.views, function (view, key)
            {
                view.trigger("controller:unselectall");
            }, this);
        },

        watchForWindowResize: function()
        {
            _.bindAll(this, "onViewResize");
            $(window).on("resize", this.onViewResize);
            this.on("close", this.stopWatchingWindowResize, this);
        },

        stopWatchingWindowResize: function()
        {
            $(window).off("resize", this.onViewResize);
        },

        onViewResize: function()
        {
            var containerHeight = this.layout.$el.parent().height();
            var mapAndChartsContainerWidth = this.layout.$("#expandoLeftColumn").width();
            _.each(this.views, function(view)
            {
                view.trigger("controller:resize", containerHeight, mapAndChartsContainerWidth);
            }, this);
        }
    });
});