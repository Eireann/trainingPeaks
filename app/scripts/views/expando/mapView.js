define(
[
    "TP",
    "utilities/mapping/mapUtils",
    "utilities/charting/chartColors",
    "hbs!templates/views/expando/mapTemplate"
],
function (
    TP,
    MapUtils,
    chartColors,
    mapTemplate
    )
{

    return TP.ItemView.extend(
    {

        className: "expandoMapPod",

        template:
        {
            type: "handlebars",
            template: mapTemplate
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
            this.selections = [];

            this.stateModel = options.stateModel;

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
            this.model.get("detailData").on("change:flatSamples", this.onModelFetched, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function ()
        {
            this.model.get("detailData").off("change:flatSamples", this.onModelFetched, this);
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
            this.listenTo(this.stateModel.get("ranges"), "add", _.bind(this._onRangeAdded, this));
            this.listenTo(this.stateModel.get("ranges"), "remove", _.bind(this._onRangeRemoved, this));
            this.listenTo(this.stateModel.get("ranges"), "reset", _.bind(this._onRangesReset, this));
            this.listenTo(this.stateModel, "change:hover", _.bind(this._onHoverChange, this));
            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._onPrimaryRangeChange, this));
        },

        _onRangeAdded: function(range, ranges, options)
        {

            var selection = this.findMapSelection(range.get("begin"), range.get("end"));
            if (!selection)
            {
                selection = this.createMapSelection(range, options);
                this.addSelectionToMap(selection);
            }

        },

        _onRangeRemoved: function(range, ranges, options)
        {
            var selection = this.findMapSelection(range.get("begin"), range.get("end"));
            if (selection)
            {
                this.removeSelectionFromMap(selection);
                this.selections = _.without(this.selections, selection);
            }

        },

        _onRangesReset: function(ranges, options)
        {
            var self = this;

            _.each(this.selections, this.removeSelectionFromMap, this);
            this.selections = [];

            ranges.each(function(range)
            {
                self._onRangeAdded(range, ranges, options);
            });
        },

        _onPrimaryRangeChange: function(stateModel, range, options)
        {
            if(this.primarySelection)
            {
                if(range === this.primarySelection.range) return;
                this.removeSelectionFromMap(this.primarySelection);
            }

            if(range)
            {
                this.primarySelection = this.createMapSelection(range, { color: chartColors.mapPrimarySelection });
                this.addSelectionToMap(this.primarySelection);
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
            var mapLayer = MapUtils.createHighlight(latLngs, options);

            var selection = {
                begin: workoutStatsForRange.get("begin"),
                end: workoutStatsForRange.get("end"),
                range: workoutStatsForRange,
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

        _onHoverChange: function (state, offset, options)
        {
            if (!this.dataParser.hasLatLongData)
            {
                return;
            }
            if (!_.isNumber(offset))
            {
                this.hideHoverMarker();
            }
            else
            {
                var latLong = this.dataParser.getLatLongFromOffset(offset);
                
                if (latLong !== null)
                {
                    this.showHoverMarker(latLong.lat, latLong.lng);
                }
                else
                {
                    this.hideHoverMarkerWithDelay();
                }
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
            this.on("controller:resize", this.setViewSize, this);
            this.on("close", function ()
            {
                this.off("controller:resize", this.setViewSize, this);
            }, this);
        },

        setViewSize: function()
        {
            if (this.map)
            {
                this.map.invalidateSize();
            }
        }
    });
});
