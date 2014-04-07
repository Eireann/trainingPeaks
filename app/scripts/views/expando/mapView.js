define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "leaflet",
    "utilities/mapping/mapUtils",
    "utilities/charting/chartColors",
    "hbs!templates/views/expando/mapTemplate"
],
function (
    $,
    _,
    setImmediate,
    TP,
    L,
    MapUtils,
    chartColors,
    mapTemplate
    )
{

    return TP.ItemView.extend(
    {

        wrapperClassName: "expandoMapPod",

        template:
        {
            type: "handlebars",
            template: mapTemplate
        },

        modelEvents: {},

        initialize: function(options)
        {
            this.map = null;
            this.selections = [];
            this.baseLayers = [];

            this.stateModel = options.stateModel;

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for map view";

            this.detailDataPromise = options.detailDataPromise;
        },

        onRender: function()
        {
            var self = this;

            this.watchForModelChanges();
            this._watchForStateModelChanges();
            this._watchForPodResize();
            this.$el.addClass("waiting");
            this.$el.removeClass("hidden");
            setImmediate(function () { self.detailDataPromise.then(_.bind(self.onModelFetched, self)); });
        },

        watchForModelChanges: function()
        {
            this.listenTo(this.model.get("detailData"), "change", _.bind(this.onModelChanged, this));
        },

        onModelFetched: function ()
        {
            this.$el.removeClass("waiting");
            this.createAndDisplayMap();
        },

        onModelChanged: function(model)
        {
            if(_.intersection(["flatSamples", "disabledDataChannels", "availableDataChannels", "channelCuts"], _.keys(model.changed)).length)
            {
                this._getGraphData().resetLatLonArray();
                this.createAndDisplayMap();
            }
        },

        createAndDisplayMap: function ()
        {
            this.$el.addClass("noData");

            if (!this.model.get("detailData").get("flatSamples"))
            {
                return;
            }

            var latLongArray = this._getGraphData().getLatLonArray();
            if (latLongArray)
            {

                this.$el.removeClass("noData");

                // without setImmediate after removing noData class, the map doesn't get the correct size
                setImmediate(_.bind(function()
                {
                    if (!this.map)
                    {
                        this.map = MapUtils.createMapOnContainer(this.$("#expandoMap")[0]);

                        if(_.has(this.options, "drag") && !this.options.drag)
                        {
                            this.map.dragging.disable();
                        }

                        if(_.has(this.options, "touchZoom") && !this.options.touchZoom)
                        {
                            this.map.touchZoom.disable();
                            this.map.doubleClickZoom.disable();
                        }
                    }

                    MapUtils.removeItemsFromMap(this.map, this.baseLayers);
                    this.baseLayers = [];

                    //this.baseLayers.push(this.addMouseHoverBuffer(latLongArray));
                    this.baseLayers.push(MapUtils.setMapData(this.map, latLongArray));
                    this.baseLayers.push(MapUtils.calculateAndAddMileMarkers(this.map, this._getGraphData(), 10));
                    this.baseLayers.push(MapUtils.addStartMarker(this.map, latLongArray[0]));
                    this.baseLayers.push(MapUtils.addFinishMarker(this.map, latLongArray[latLongArray.length - 1]));
                }, this));

            }

            if(this.$el.hasClass("noData"))
            {
                this.trigger("noData");
            }
            else
            {
                this.trigger("hasData");
            }
        },

        addMouseHoverBuffer: function (latLongArray)
        {
            this.mapMouseBuffer = MapUtils.addTransparentBuffer(this.map, latLongArray);

            this.listenTo(this.mapMouseBuffer, "mouseout", _.bind(this.onMapMouseOut, this));
        },

        onMapMouseOut: function (e)
        {
            this.hideHoverMarker();
        },

        _watchForStateModelChanges: function ()
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
            if(!this.map)
            {
                return null;
            }
            var latLngs = this._getGraphData().getLatLonBetweenMsOffsets(workoutStatsForRange.get("begin"), workoutStatsForRange.get("end"));
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
            if(!this.map || !selection)
            {
                return;
            }
            this.selections.push(selection);
            this.map.addLayer(selection.mapLayer);
        },

        removeSelectionFromMap: function (selection)
        {
            if(this.map && selection)
            {
                this.map.removeLayer(selection.mapLayer);
            }
        },

        _onHoverChange: function (state, offset, options)
        {
            if (!this.map || !this._getGraphData().hasLatLongData)
            {
                return;
            }
            if (!_.isNumber(offset))
            {
                this.hideHoverMarker();
            }
            else
            {
                var latLong = this._getGraphData().getLatLonFromMsOffset(offset);

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
                var icon = new L.Icon.Default({ iconSize: [23, 32] });
                this.hoverMarker = L.marker(position, { icon: icon });
                this.hoverMarker.addTo(this.map);
            }
            else
            {
                this.hoverMarker.setLatLng(position);
            }
        },

        _watchForPodResize: function ()
        {
            this.on("pod:resize", this._updateMapSize, this);
        },

        _updateMapSize: function()
        {
            if (this.map)
            {
                this.map.invalidateSize();
            }
        },

        _getGraphData: function()
        {
            return this.model.get("detailData").graphData;
        }
    });
});
