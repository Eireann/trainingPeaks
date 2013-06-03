﻿define(
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
            this.workoutModel = options.workoutModel;
            this.workoutDetailsModel = options.workoutDetailsModel;
            this.prefetchConfig = options.prefetchConfig;

            this.layout = new ExpandoLayout();
            this.layout.on("show", this.show, this);

            this.views = {};

            _.bindAll(this, "onModelFetched");
        },

        show: function()
        {
            var self = this;

            this.closeViews();
            this.preFetchDetailData();

            this.views.graphView = new GraphView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.mapView = new MapView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.statsView = new StatsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.lapsView = new LapsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });
            this.views.chartsView = new ChartsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise });

            this.layout.$el.addClass("waiting");

            this.watchForModelChanges();
            this.watchForWindowResize();

            this.watchForViewEvents();

            setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });

            // if we don't have a workout, just resolve the deferred to let everything render
            if(!this.model.get("workoutId"))
                this.prefetchConfig.detailDataPromise.resolve();

        },

        onModelFetched: function()
        {
            this.layout.$el.removeClass("waiting");
            
            this.layout.graphRegion.show(this.views.graphView);
            this.layout.mapRegion.show(this.views.mapView);
            this.layout.statsRegion.show(this.views.statsView);
            this.layout.lapsRegion.show(this.views.lapsView);
            this.layout.chartsRegion.show(this.views.chartsView);

            this.onViewResize();
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
        },
 
        watchForModelChanges: function()
        {
            this.model.on("deviceFileUploaded", this.fetchDetailData, this);
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
                view.on("resize", this.onViewResize, this);
            }, this);

        },

        onRangeSelected: function (workoutStatsForRange, options, triggeringView)
        {

            if (!options.removeFromSelection)
            {
                this.mostRecentlySelectedRange = workoutStatsForRange;
            }

            _.each(this.views, function(view, key)
            {
                view.trigger("controller:rangeselected", workoutStatsForRange, options, triggeringView);
            }, this);

            // no need to load it if we're trying to unselect it
            if (!workoutStatsForRange.hasLoaded && !options.removeFromSelection)
            {
                var self = this;
                workoutStatsForRange.fetch().done(function ()
                {
                    workoutStatsForRange.hasLoaded = true;

                    // if we change ranges before this range loads, don't bother to display it
                    if (workoutStatsForRange === self.mostRecentlySelectedRange)
                    {
                        _.each(self.views, function(view, key)
                        {
                            view.trigger("controller:rangeselected", workoutStatsForRange, options, triggeringView);
                        }, self);
                    }
                });
            }
        },
        
        onGraphHover: function (msOffset)
        {
            _.each(this.views, function (view, key)
            {
                view.trigger("controller:graphhover", msOffset);
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
            _.each(this.views, function(view)
            {
                view.trigger("controller:resize", containerHeight);
            }, this);
        }
    });
});