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
                throw "detailDataPromise is required for map view";

            this.detailDataPromise = options.detailDataPromise;
        },

        onRender: function()
        {
            var self = this;
            this.watchForModelChanges();
            this.watchForControllerEvents();
            this.watchForControllerResize();
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


            var latLongArray = this.dataParser.getLatLonArray();
            if (latLongArray)
            {
                this.addMouseHoverBuffer(latLongArray);
                MapUtils.setMapData(this.map, latLongArray);
                MapUtils.calculateAndAddMileMarkers(this.map, this.dataParser, 15);
            }
        },

        addMouseHoverBuffer: function (latLongArray)
        {
            this.mapMouseBuffer = MapUtils.addTransparentBuffer(this.map, latLongArray);

            this.mapMouseBuffer.on("mousemove", this.onMapHover, this);
            this.mapMouseBuffer.on("mouseout", this.onMapMouseOut, this);
            this.on("close", this.unbindMouseHoverEvents, this);
        },

        unbindMouseHoverEvents: function ()
        {
            this.mapMouseBuffer.off("mousemove", this.onMapHover, this);
            this.mapMouseBuffer.off("mouseout", this.onMapMouseOut, this);
        },

        onMapHover: function (e)
        {

            var linePoint = this.mapMouseBuffer.closestLayerPoint(e.layerPoint);
            var latLng = this.map.layerPointToLatLng(linePoint);
            this.showHoverMarker(latLng.lat, latLng.lng);
            return;
            /*
            close but not quite - because leaflet is converting lat lng to pixels and back, the resulting values are off by a thousandth or so,
            so they don't map nicely to a simple lookup of our lat lng array without some calculating

            var msOffset = this.dataParser.findMsOffsetByLatLng(latLng.lat, latLng.lng);
            if (msOffset)
            {
                this.trigger("maphover", msOffset);
                console.log(msOffset);
            } else
            {
                console.log("No point");
            }
            */
        },

        onMapMouseOut: function (e)
        {
            this.hideHoverMarker();
        },

        parseData: function ()
        {
            var flatSamples = this.model.get("detailData").get("flatSamples");
            this.dataParser.loadData(flatSamples);
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
            var mapLayer = MapUtils.createHighlight(this.map, latLngs, options.dataType);

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

        onGraphHover: function (msOffset)
        {
            if (this.dataParser.hasLatLongData)
            {
                var index = this.dataParser.findIndexByMsOffset(msOffset);

                if (index === null)
                {
                    return;
                }

                var lat = this.dataParser.dataByChannel.Latitude[index][1];
                var long = this.dataParser.dataByChannel.Longitude[index][1];

                if (_.isNaN(lat) || _.isNaN(long))
                {
                    this.hideHoverMarkerWithDelay();
                }
                else
                {
                    this.showHoverMarker(lat, long);
                }
            }
        },

        onGraphLeave: function ()
        {
            if (this.dataParser.hasLatLongData)
            {
                this.hideHoverMarker();

            }
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
            this.on("controller:resize", this.setViewWidth, this);
            this.on("close", function ()
            {
                this.off("controller:resize", this.setViewWidth, this);
            }, this);
        },

        setViewWidth: function ()
        {
            if (this.map)
            {
                this.map.invalidateSize();
            }
        }


    });
});