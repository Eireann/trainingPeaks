define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/flotToolTipPositioner",
    "utilities/mapping/mapUtils",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function(
    $,
    _,
    setImmediate,
    TP,
    defaultFlotOptions,
    FlotCustomToolTip,
    toolTipPositioner,
    MapUtils,
    workoutTypes,
    workoutQuickViewMapAndGraphTemplate)
{

    var mapAndGraphViewBase =
    {
        className: "mapAndGraph",

        showThrobbers: true,

        template:
        {
            type: "handlebars",
            template: workoutQuickViewMapAndGraphTemplate
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },

        initialize: function(options)
        {
            _.bindAll(this, "onModelFetched");

            this.map = null;
            this.graph = null;
            this.mapLayers = [];

            if (!options.prefetchConfig)
                throw "Prefetch config is required for map and graph view";

            this.prefetchConfig = options.prefetchConfig;
        },

        onRender: function()
        {
            var self = this;

            this.$el.addClass("waiting");

            this.listenTo(this.model.get("detailData"), "change", _.bind(this._onSeriesChanged, this));

            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").getFetchPromise();

                if (!this.model.get("workoutId"))
                    this.prefetchConfig.detailDataPromise.resolve();
            }

            // if we already have it in memory, render it
            if ( this.model.get("detailData").hasSamples())
            {
                this.onModelFetched();
            }
            else
            {
                setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });
            }

        },

        reRender: function()
        {
            var self = this;
            setImmediate(function() {self.createAndShowMapAndGraph();});
        },

        onModelFetched: function()
        {
            var self = this;

            this.$el.removeClass("waiting");

            setImmediate(function() { self.createAndShowMapAndGraph(); });
        },

        _onSeriesChanged: function(model)
        {
            if(_.intersection(["disabledDataChannels", "availableDataChannels", "channelCuts", "flatSamples"], _.keys(model.changed)).length)
            {
                var self = this;
                setImmediate(function() { self.createAndShowMapAndGraph(); });
            }
        },

        createAndShowMapAndGraph: function()
        {

            if(!this.$el.is(":visible"))
            {
                return;
            }
            // no map or graph
            else if (!this.model.get("detailData").hasSamples())
            {
                this.$("#quickViewMap").addClass("noData");
                this.$("#quickViewGraph").addClass("noMap").addClass("noData");
            }
            // graph but no map
            else if (!this._getGraphData().hasLatLongData)
            {
                this.$("#quickViewMap").addClass("noData");
                this.$("#quickViewGraph").addClass("noMap").removeClass("noData");
                this.createAndShowGraph();
            }
            // map and graph
            else
            {
                this.$("#quickViewMap").removeClass("noData");
                this.$("#quickViewGraph").removeClass("noMap").removeClass("noData");
                this.createAndShowMap();
                this.createAndShowGraph();
            }
        },

        createAndShowMap: function()
        {

            if (!this.map)
                this.map = MapUtils.createMapOnContainer(this.$("#quickViewMap .map")[0]);

            MapUtils.removeItemsFromMap(this.map, this.mapLayers);
            this.mapLayers = [];

            var latLongArray = this._getGraphData().getLatLonArray();
            this.mapLayers.push(MapUtils.setMapData(this.map, latLongArray));
            this.mapLayers.push(MapUtils.calculateAndAddMileMarkers(this.map, this._getGraphData(), 6));
            this.mapLayers.push(MapUtils.addStartMarker(this.map, latLongArray[0]));
            this.mapLayers.push(MapUtils.addFinishMarker(this.map, latLongArray[latLongArray.length - 1]));
        },

        createAndShowGraph: function()
        {
            var self = this;

            var priority =
            [
                "Power",
                "Speed",
                "HeartRate",
                "Cadence",
                "RightPower",
                "Temperature",
                "Torque"
            ];

            // Get all series & axes in the data set
            var series = this._getGraphData().getSeries();
            this._getGraphData().workoutTypeValueId = this.model.get("workoutTypeValueId");
            var yaxes = this._getGraphData().getYAxes(series);

            // Hide all axes by default in the data set
            _.each(yaxes, function(axis)
            {
                axis.show = false;
                axis.tickLength = 0;
            });

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(FlotCustomToolTip.buildGraphToolTip(series, series, flotItem, self.model.get("workoutTypeValueId"), "time"));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };
            var flotOptions = defaultFlotOptions.getMultiChannelOptions(onHoverHandler);

            flotOptions.yaxes = yaxes;
            flotOptions.xaxes[0].tickLength = 0;
            flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            flotOptions.grid.borderColor = "#9a9999";

            if ($.plot)
            {
                this.plot = $.plot(this.$("#quickViewGraph .graph"), series, flotOptions);
                if (this.model.get("workoutTypeValueId") === TP.utils.workout.types.getIdByName("Swim"))
                    this.plot.setFilter(0);
                else
                    this.plot.setFilter(10);

            }
        },

        _getGraphData: function()
        {
            return this.model.get("detailData").graphData;
        }

    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
