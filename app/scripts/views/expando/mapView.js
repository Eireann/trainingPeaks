define(
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
            this.selections = [];

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

            var selection;
            if (workoutStatsForRange.removeFromSelection)
            {
                selection = this.findMapSelection(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"));
                if(selection)
                {
                    this.removeSelectionFromMap(selection);
                    this.selections = _.without(this.selections, selection);
                }
            } else if(workoutStatsForRange.addToSelection)
            {
                selection = this.createMapSelection(workoutStatsForRange);
                this.addSelectionToMap(selection);
            }
        },

        findMapSelection: function(begin, end)
        {
            return _.find(this.selections, function(selection)
            {
                return selection.begin === begin && selection.end === end;
            });
        },

        createMapSelection: function(workoutStatsForRange)
        {
            var sampleStartIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("begin"));
            var sampleEndIndex = this.dataParser.findIndexByMsOffset(workoutStatsForRange.get("end"));
            var mapLayer = MapUtils.createHighlight(this.map, this.dataParser.getLatLonArray().slice(sampleStartIndex, sampleEndIndex));

            var selection = {
                begin: workoutStatsForRange.get("begin"),
                end: workoutStatsForRange.get("end"),
                mapLayer: mapLayer
            };

            return selection;
        },

        addSelectionToMap: function(selection)
        {
            this.selections.push(selection);
            this.map.addLayer(selection.mapLayer);
        },

        removeSelectionFromMap: function(selection)
        {
            this.map.removeLayer(selection.mapLayer);
        },

        onGraphHover: function (msOffset)
        {
            var index = this.dataParser.findIndexByMsOffset(msOffset);
            var lat = this.dataParser.dataByChannel.Latitude[index][1];
            var long = this.dataParser.dataByChannel.Longitude[index][1];

            if (isNaN(lat) || isNaN(long))
            {
                this.hideHoverMarkerWithDelay();
            } else
            {
                this.showHoverMarker(lat, long);
            }
        },

        onGraphLeave: function ()
        {
            this.hideHoverMarker();
        },

        hideHoverMarker: function()
        {
            this.clearHoverHideTimeout();
            if (this.hoverMarker)
            {
                this.map.removeLayer(this.hoverMarker);
                this.hoverMarker = null;
            }
        },

        hideHoverMarkerWithDelay: function()
        {
            this.clearHoverHideTimeout();
            var self = this;
            this.hoverHideTimeout = setTimeout(function()
            {
                self.hideHoverMarker();
            }, 1000);
        },

        clearHoverHideTimeout: function()
        {
            if(this.hoverHideTimeout)
            {
                clearTimeout(this.hoverHideTimeout);
            }

        },

        showHoverMarker: function(lat, long)
        {
            this.clearHoverHideTimeout();
            var position = [lat, long];
            if (!this.hoverMarker)
            {
                this.hoverMarker = L.marker(position);
                this.hoverMarker.addTo(this.map);
            }
            else
            {
                this.hoverMarker.setLatLng(position);
            }
        }

    });
});