define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/flotOptions",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/flotToolTipPositioner",
    "utilities/mapping/mapUtils",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function(
    TP,
    DataParser,
    defaultFlotOptions,
    flotCustomToolTip,
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
            if (this.model.get("detailData") !== null && this.model.get("detailData").attributes.flatSamples !== null)
            {
                this.onModelFetched();
            }
            else
            {
                setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });
            }

        },

        onModelFetched: function()
        {
            var self = this;

            this.$el.removeClass("waiting");

            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            setImmediate(function() { self.createAndDisplayMapAndGraph(); });
        },

        _onSeriesChanged: function(model)
        {
            if(_.intersection(["disabledDataChannels", "availableDataChannels", "channelCuts", "flatSamples"], _.keys(model.changed)).length)
            {
                var self = this;
                setImmediate(function() { self.createAndDisplayMapAndGraph(); });
            }
        },

        createAndDisplayMapAndGraph: function()
        {
            if (!this.model.get("detailData") || !this.model.get("detailData").get("flatSamples"))
                return;

            this.parseData();
            this.createAndShowMap();
            this.createAndShowGraph();
        },

        createAndShowMap: function()
        {

            if (!this._getDataParser().hasLatLongData)
            {
                this.$("#quickViewMap").addClass("hidden");
                return;
            } else
            {
                this.$("#quickViewMap").removeClass("hidden");
            }

            if (!this.map)
                this.map = MapUtils.createMapOnContainer(this.$("#quickViewMap")[0]);

            var latLngArray = this._getDataParser().getLatLonArray();
            MapUtils.setMapData(this.map, latLngArray);
            MapUtils.calculateAndAddMileMarkers(this.map, this._getDataParser(), 6);
            MapUtils.addStartMarker(this.map, latLngArray[0]);
            MapUtils.addFinishMarker(this.map, latLngArray[latLngArray.length - 1]);
        },

        parseData: function()
        {
            var flatSamples = this.model.get("detailData").attributes.flatSamples;
            this._getDataParser().loadData(flatSamples);
        },

        createAndShowGraph: function()
        {
            var self = this;
            if (!this._getDataParser().hasLatLongData)
            {
                self.$("#quickViewGraph").css("height", "350px");
            }

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

            var numSeries = 0;

            // Get all series & axes in the data set
            var series = this._getDataParser().getSeries();
            this._getDataParser().workoutTypeValueId = this.model.get("workoutTypeValueId");
            var yaxes = this._getDataParser().getYAxes(series);

            // Hide all axes by default in the data set
            _.each(yaxes, function(axis)
            {
                axis.show = false;
                axis.tickLength = 0;
            });

            var onHoverHandler = function(flotItem, $tooltipEl)
            {
                $tooltipEl.html(flotCustomToolTip(series, series, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0], self.model.get("workoutTypeValueId")));
                toolTipPositioner.updatePosition($tooltipEl, self.plot);
            };
            var flotOptions = defaultFlotOptions.getMultiChannelOptions(onHoverHandler);

            flotOptions.yaxes = yaxes;
            flotOptions.xaxes[0].tickLength = 0;
            flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            flotOptions.grid.borderColor = "#9a9999";

            if ($.plot)
            {
                this.plot = $.plot(this.$("#quickViewGraph"), series, flotOptions);
                if (this.model.get("workoutTypeValueId") === TP.utils.workout.types.getIdByName("Swim"))
                    this.plot.setFilter(0);
                else
                    this.plot.setFilter(10);

            }
        },

        _getDataParser: function()
        {
            return this.model.get("detailData").getDataParser();
        }

    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
