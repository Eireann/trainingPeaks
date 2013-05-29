﻿define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/mapping/mapUtils",
    "hbs!templates/views/expando/mapTemplate"
],
function (
    TP,
    DataParser,
    MapUtils,
    mapTemplate
    )
{

    /*
    TODO:
    google maps
    how many markers?
    mile marker icons
    */

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: mapTemplate
        },

        initialEvents: function ()
        {
            this.model.off("change", this.render);
        },

        initialize: function (options)
        {
            _.bindAll(this, "onModelFetched");

            this.dataParser = new DataParser();
            this.map = null;
            this.graph = null;


            if (!options.detailDataPromise)
                throw "detailDataPromise is required for map and graph view";

            this.detailDataPromise = options.detailDataPromise;
        },

        onRender: function ()
        {
            var self = this;
            this.watchForModelChanges();
            this.watchForControllerEvents();
            this.$el.addClass("waiting");
            setImmediate(function () { self.detailDataPromise.then(self.onModelFetched); });
        },

        watchForModelChanges: function ()
        {
            this.model.get("detailData").on("change:flatSamples.samples", this.onModelFetched, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function ()
        {
            this.model.get("detailData").off("change:flatSamples.samples", this.onModelFetched, this);
        },

        onModelFetched: function ()
        {
            this.$el.removeClass("waiting");
            this.createAndDisplayMap();
        },

        createAndDisplayMap: function ()
        {
            if (!this.model.get("detailData").get("flatSamples"))
                return;

            this.parseData();

            if (!this.map)
                this.map = MapUtils.createMapOnContainer(this.$("#expandoMap")[0]);

            MapUtils.setMapData(this.map, this.dataParser.getLatLonArray());
            MapUtils.calculateAndAddMileMarkers(this.map, this.dataParser, 15);
        },

        parseData: function ()
        {
            var flatSamples = this.model.get("detailData").get("flatSamples");
            this.dataParser.loadData(flatSamples);
        },

        watchForControllerEvents: function ()
        {
            this.on("controller:rangeselected", this.onRangeSelected, this);
            this.on("close", this.stopWatchingControllerEvents, this);
            this.on("controller:graphhover", this.onGraphHover, this);
            this.on("controller:graphleave", this.onGraphLeave, this);
        },

        stopWatchingControllerEvents: function ()
        {
            this.off("controller:rangeselected", this.onRangeSelected, this);
            this.off("controller:graphhover", this.onGraphHover, this);
            this.off("controller:graphleave", this.onGraphLeave, this);
        },

        onRangeSelected: function (workoutStatsForRange)
        {
            if (this.selection)
            {
                this.map.removeLayer(this.selection);
                this.selection = null;
            }

            var sampleStartIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("begin"));
            var sampleEndIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("end"));
            this.selection = MapUtils.highlight(this.map, this.dataParser.getLatLonArray().slice(sampleStartIndex, sampleEndIndex));
        },

        onGraphHover: function (msOffset)
        {
            var index = this.dataParser.findIndexByMsOffset(msOffset);
            var item = this.dataParser.getLatLonArray()[index];
            if (!this.hoverMarker)
            {
                this.hoverMarker = L.marker(item);
                this.hoverMarker.addTo(this.map);
            }
            else
            {
                this.hoverMarker.setLatLng(item);
            }
        },

        onGraphLeave: function ()
        {
            if (this.hoverMarker)
            {
                this.map.removeLayer(this.hoverMarker);
                this.hoverMarker = null;
            }
        }
    });
});