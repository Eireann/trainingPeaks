define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/defaultFlotOptions",
    "utilities/mapping/mapUtils",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function(
    TP,
    DataParser,
    getDefaultFlotOptions,
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

            this.dataParser = new DataParser();
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

            this.watchForModelChanges();

            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").createPromise();

                if (!this.model.get("workoutId"))
                    this.prefetchConfig.detailDataPromise.resolve();
            }

            // if we already have it in memory, render it
            if (this.model.get("detailData") !== null && this.model.get("detailData").attributes.flatSamples !== null)
            {
                this.onModelFetched();
            } else
            {
                setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });
            }

        },

        watchForModelChanges: function()
        {
            this.model.get("detailData").on("change:flatSamples.samples", this.onModelFetched, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function()
        {
            this.model.get("detailData").off("change:flatSamples.samples", this.onModelFetched, this);
        },

        onModelFetched: function()
        {
            var self = this;

            this.$el.removeClass("waiting");

            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            setImmediate(function() { self.createAndDisplayMapAndGraph(); });
        },

        createAndDisplayMapAndGraph: function()
        {
            if (!this.model.get("detailData") || !this.model.get("detailData").get("flatSamples"))
                return;

            this.parseData();
            this.createAndShowGraph();

            if (!this.map)
                this.map = MapUtils.createMapOnContainer(this.$("#quickViewMap")[0]);

            MapUtils.setMapData(this.map, this.dataParser.getLatLonArray());
            MapUtils.calculateAndAddMileMarkers(this.map, this.dataParser, 10);
        },

        parseData: function()
        {
            var flatSamples = this.model.get("detailData").attributes.flatSamples;
            this.dataParser.loadData(flatSamples);
        },

        createAndShowGraph: function()
        {
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
            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            // Hide all series & axes by default in the data set
            _.each(series, function(s) { s.lines.show = false; });
            _.each(yaxes, function(axis)
            {
                axis.show = false;
                axis.tickLength = 0;
            });

            // Pick the top 2 series by priority and show those
            _.each(priority, function(channel)
            {
                var s = _.where(series, { label: channel });
                if (s && s[0] && numSeries++ < 2)
                {
                    s[0].lines.show = true;
                    yaxes[s[0].yaxis - 1].show = true;
                    yaxes[s[0].yaxis - 1].position = numSeries === 1 ? "left" : "right";
                }
            });

            // Show Elevation if we have it
            var elevationSeries = _.where(series, { label: "Elevation" });
            if (elevationSeries && elevationSeries[0])
                elevationSeries[0].lines.show = true;

            var flotOptions = getDefaultFlotOptions(series);

            flotOptions.yaxes = yaxes;
            flotOptions.xaxes[0].tickLength = 0;

            $.plot(this.$("#quickViewGraph"), series, flotOptions);
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
