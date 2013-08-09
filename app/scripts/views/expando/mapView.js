define(
[
    "TP",
    "utilities/mapping/mapUtils",
    "hbs!templates/views/expando/mapTemplate"
],
function (
    TP,
    MapUtils,
    mapTemplate
    )
{

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

            this.map = null;
            this.graph = null;
            this.selections = [];

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for map view";

            if (!options.dataParser)
                throw "dataParser is required for map view";

            this.dataParser = options.dataParser;
            this.detailDataPromise = options.detailDataPromise;
        },

        onRender: function()
        {
            var self = this;
            this.watchForModelChanges();
            this.watchForControllerEvents();
            this.watchForControllerResize();
            this.$el.addClass("waiting");
            this.$el.removeClass("hidden");
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

            if (!this.map)
                this.map = MapUtils.createMapOnContainer(this.$("#expandoMap")[0]);


            var latLongArray = this.dataParser.getLatLonArray();
            if (latLongArray)
            {
                //this.addMouseHoverBuffer(latLongArray);
                MapUtils.setMapData(this.map, latLongArray);
                MapUtils.calculateAndAddMileMarkers(this.map, this.dataParser, 10);
                MapUtils.addStartMarker(this.map, latLongArray[0]);
                MapUtils.addFinishMarker(this.map, latLongArray[latLongArray.length - 1]);
            }
        },

        addMouseHoverBuffer: function (latLongArray)
        {
            this.mapMouseBuffer = MapUtils.addTransparentBuffer(this.map, latLongArray);

            this.mapMouseBuffer.on("mouseout", this.onMapMouseOut, this);
            this.on("close", this.unbindMouseHoverEvents, this);
        },

        unbindMouseHoverEvents: function ()
        {
            this.mapMouseBuffer.off("mouseout", this.onMapMouseOut, this);
        },

        onMapMouseOut: function (e)
        {
            this.hideHoverMarker();
        },

        watchForControllerEvents: function ()
        {
            this.on("controller:rangeselected", this.onRangeSelected, this);
            this.on("controller:unselectall", this.onUnSelectAll, this);
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

        onRangeSelected: function (workoutStatsForRange, options, triggeringView)
        {
            if (!options)
                return;
            
            var selection;
            if (options.removeFromSelection)
            {
                // remove it, if it was selected
                selection = this.findMapSelection(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"));
                if (selection)
                {
                    this.removeSelectionFromMap(selection);
                    this.selections = _.without(this.selections, selection);
                }
            } else if (options.addToSelection)
            {
                // add it, if it wasn't already selected
                selection = this.findMapSelection(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"));
                if (!selection)
                {
                    selection = this.createMapSelection(workoutStatsForRange, options);
                    this.addSelectionToMap(selection);
                }
            }
        },

        findMapSelection: function (begin, end)
        {
            return _.find(this.selections, function (selection)
            {
                return selection.begin === begin && selection.end === end;
            });
        },

        createMapSelection: function (workoutStatsForRange, options)
        {
            var latLngs = this.dataParser.getLatLonBetweenMsOffsets(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"));
            var mapLayer = MapUtils.createHighlight(latLngs, options.dataType);

            var selection = {
                begin: workoutStatsForRange.get("begin"),
                end: workoutStatsForRange.get("end"),
                mapLayer: mapLayer
            };

            return selection;
        },

        addSelectionToMap: function (selection)
        {
            this.selections.push(selection);
            this.map.addLayer(selection.mapLayer);
        },

        removeSelectionFromMap: function (selection)
        {
            this.map.removeLayer(selection.mapLayer);
        },

        onUnSelectAll: function ()
        {
            _.each(this.selections, function (selection)
            {
                this.removeSelectionFromMap(selection);
            }, this);
            this.selections = [];
        },

        onGraphHover: function (options)
        {
            var xAxisOffset = options.msOffset;
            var latLong = this.dataParser.getLatLongFromOffset(xAxisOffset);
            
            if (latLong !== null)
                this.showHoverMarker(latLong.lat, latLong.lng);
            else
                this.hideHoverMarkerWithDelay();
        },

        onGraphLeave: function ()
        {
            if (this.dataParser.hasLatLongData)
                this.hideHoverMarker();
        },

        hideHoverMarker: function ()
        {
            this.clearHoverHideTimeout();
            if (this.hoverMarker)
            {
                this.map.removeLayer(this.hoverMarker);
                this.hoverMarker = null;
            }
        },

        hideHoverMarkerWithDelay: function ()
        {
            this.clearHoverHideTimeout();
            var self = this;
            this.hoverHideTimeout = setTimeout(function ()
            {
                self.hideHoverMarker();
            }, 1000);
        },

        clearHoverHideTimeout: function ()
        {
            if (this.hoverHideTimeout)
            {
                clearTimeout(this.hoverHideTimeout);
            }
        },

        showHoverMarker: function (lat, long)
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
        },

        watchForControllerResize: function ()
        {
            this.on("controller:resize", this.setViewSize, this);
            this.on("close", function ()
            {
                this.off("controller:resize", this.setViewSize, this);
            }, this);
        },

        setViewSize: function (containerHeight, containerWidth, overrideMinHeight)
        {
            var bottomMargin = 10;
            var mapHeight = Math.floor((containerHeight - bottomMargin) * 0.50);

            // apply offset set by resize bar
            mapHeight = mapHeight - (this.offset || 0);

            this.$el.closest("#expandoMapRegion").height(mapHeight);
            this.$el.height(mapHeight);
            this.$("#expandoMap").height(mapHeight);
            if (this.map)
            {
                this.map.invalidateSize();
            }
        },
        setOffset: function(offset)
        {
            this.offset = offset;
        }
    });
});