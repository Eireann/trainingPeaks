﻿define(
[
    "setImmediate",
    "TP",
    "framework/filteredSubCollection",
    "views/packeryCollectionView",
    "layouts/expandoLayout",
    "views/expando/statsView",
    "views/expando/lapsView",
    "views/expando/editControlsView",
    "expando/expandoPodBuilder",
    "expando/models/expandoStateModel"
],
function(
    setImmediate,
    TP,
    FilteredSubCollection,
    PackeryCollectionView,
    ExpandoLayout,
    StatsView,
    LapsView,
    EditControlsView,
    expandoPodBuilder,
    ExpandoStateModel
)
{
    function userCanUsePod(chartModel)
    {
        var featureAttributes = { podTypeId: chartModel.get("podType") };
        return theMarsApp.featureAuthorizer.canAccessFeature(
            theMarsApp.featureAuthorizer.features.UsePod,
            featureAttributes
        );
    }

    return TP.Controller.extend(
    {
        getLayout: function()
        {
            return this.layout;
        },

        initialize: function(options)
        {
            this.model = options.model;
            //this.workoutModel = options.workoutModel;
            //this.workoutDetailsModel = options.workoutDetailsModel;
            this.prefetchConfig = options.prefetchConfig;

            this.layout = new ExpandoLayout();
            this.layout.on("show", this.show, this);
            this.layout.on("close", this.onLayoutClose, this);
            this.views = {};
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

            this.stateModel = new ExpandoStateModel();

            this.views.editControlsView = new EditControlsView({ model: this.model, stateModel: this.stateModel });
            this.views.statsView = new StatsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise, stateModel: this.stateModel });
            this.views.lapsView = new LapsView({ model: this.model, detailDataPromise: this.prefetchConfig.detailDataPromise, stateModel: this.stateModel });


            this.layout.$el.addClass("waiting");

            this.watchForModelChanges();
            this.watchForWindowResize();

            this.handleDetailDataPromise();
        },

        handleDetailDataPromise: function()
        {

            var self = this;
            setImmediate(function() { self.prefetchConfig.detailDataPromise.then(_.bind(self.onModelFetched, self)); });

            // if we don't have a workout, just resolve the deferred to let everything render
            if(!this.model.get("workoutId"))
                this.prefetchConfig.detailDataPromise.resolve();

        },

        onModelFetched: function()
        {
            this.layout.$el.removeClass("waiting");

            var self = this;

            // use some setImmediate's to allow everything to paint nicely
            this.layout.statsRegion.show(this.views.statsView);
            this.layout.lapsRegion.show(this.views.lapsView);
            this.layout.editControlsRegion.show(this.views.editControlsView);

            setImmediate(function()
            {
                self._createAndShowPackeryView();
                self.onViewResize();
                self._listenToPackeryReorder();
            });
        },

        onSensorDataChange: function()
        {

            var self = this;
            setImmediate(function()
            {
                self.onViewResize();
            });

        },

        preFetchDetailData: function()
        {
            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").getFetchPromise();
            }
        },

        collapse: function()
        {
            this.disableViewsResize = true;
            this.layout.$el.parent().hide();
        },

        expand: function()
        {
            this.disableViewsResize = false;
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

            this.layout.off("show", this.show, this);

        },

        watchForModelChanges: function()
        {
            this.listenTo(this.model, "deviceFileUploaded", _.bind(this.reloadDetailData, this));
            this.listenTo(this.model.get("detailData"), "changeSensorData", _.bind(this.onSensorDataChange, this));
        },

        reloadDetailData: function()
        {
            if (!this.model.get("workoutId"))
                return;

            this.prefetchConfig.detailsPromise = this.model.get("details").getFetchPromise(true);
            this.prefetchConfig.detailDataPromise = this.model.get("detailData").getFetchPromise(true);
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
        },

        _createAndShowPackeryView: function()
        {
            if(this.views.packeryView)
            {
                this.views.packeryView.close();
                this.stopListening(this.expandoPodLayout.getPodsCollection());
            }

            this.expandoPodLayout = theMarsApp.user.getExpandoSettings().getLayout(this.model.get("workoutTypeValueId"));
            this.listenTo(this.expandoPodLayout.getPodsCollection(), "add remove change", _.bind(this._savePodLayout, this));

            var data =
            {
                workout: this.model,
                detailDataPromise: this.prefetchConfig.detailDataPromise,
                stateModel: this.stateModel
            };

            var $sizer = $("<div class='sizer'></div>");

            this.filteredCollection = new FilteredSubCollection(null, {
                sourceCollection: this.expandoPodLayout.getPodsCollection(),
                filterFunction: userCanUsePod
            });

            this.views.packeryView = new PackeryCollectionView({
                itemView: expandoPodBuilder.buildView,
                collection: this.filteredCollection,
                itemViewOptions: { data: data },
                packery:
                {
                    columnWidth: $sizer[0],
                    rowHeight: $sizer[0],
                    gutter: 10
                },
                resizable: { enabled: true },
                droppable: { enabled: true }
            });
            
            this.layout.packeryRegion.show(this.views.packeryView);
        },

        _listenToPackeryReorder: function()
        {
            this.listenTo(this.views.packeryView, "reorder", _.bind(this._onReorderCharts, this));
        },

        _onReorderCharts: function()
        {
            //console.trace();
            this.expandoPodLayout.getPodsCollection().sort();
            console.log(this.expandoPodLayout.getPodsCollection().map(function(model){return model.get("podType") + ":" + model.get("index");}).join(","));
            this._savePodLayout();
        },

        _savePodLayout: function()
        {
            theMarsApp.user.getExpandoSettings().addOrUpdateLayout(this.expandoPodLayout);
            theMarsApp.user.getExpandoSettings().save();
        }

    });
});
