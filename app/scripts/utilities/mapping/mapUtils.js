define(
[
    "TP",
    "leaflet",
    "leafletGoogleTiles",
    "./leafletIcons",
    "utilities/charting/chartColors"
],
function(
    TP,
    Leaflet,
    LeafletGoogleTiles,
    LeafletIcons,
    chartColors
    )
{
    var osmURL = "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg";
    var cloudmadeURL = "http://b.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/1/256/{z}/{x}/{y}.png";
    var leafletURL = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";

    L.Google = LeafletGoogleTiles(L);

    return {
        createMapOnContainer: function(container)
        {

            var osmLayer = new L.TileLayer(osmURL);
            var cloudmadeLayer = new L.TileLayer(cloudmadeURL);
            var leafletLayer = new L.TileLayer(leafletURL);

            // Leaflet needs to know where to find images
            L.Icon.Default.imagePath = theMarsApp.assetsRoot + "images/leaflet";

            var baseMaps =
            {
                "OSM": osmLayer,
                "Cloudmade": cloudmadeLayer,
                "Leaflet": leafletLayer
            };

            var mapConfig =
            {
                scrollWheelZoom: false,
                boxZoom: true,
                layers: [osmLayer],
                center: new L.LatLng(40.012369, -105.132353),
                zoom: 8,
                maxZoom: 15
            };

            // if google was not loaded, don't try to draw on map, useful for testing
            if(typeof google !== "undefined")
            {
                var gmapLayer = new L.Google('ROADMAP');
                var gTerrainLayer = new L.Google("TERRAIN");
                var satelliteLayer = new L.Google("SATELLITE");

                baseMaps =
                {
                    "Terrain": gTerrainLayer,
                    "Google": gmapLayer,
                    "Satellite": satelliteLayer,
                    "OSM": osmLayer,
                    "Cloudmade": cloudmadeLayer,
                    "Leaflet": leafletLayer
                };

                mapConfig.layers = [gTerrainLayer];
            }


            var map = L.map(container, mapConfig);
            L.control.layers(baseMaps).addTo(map);

            return map;
        },

        setMapData: function(map, latLonArray)
        {
            var options = { color: chartColors.mapRoute };
            var polyline = this.createPolyline(latLonArray, options);
            if (latLonArray && latLonArray.length > 0)
            {
                map.fitBounds(polyline.getBounds());
            }
            polyline.addTo(map);
            return polyline;
        },

        addTransparentBuffer: function(map, latLonArray)
        {
            var polyline = this.createPolyline(latLonArray, { color: "transparent", opacity: 0, weight: 40 });
            polyline.addTo(map);
            return polyline;
        },

        createPolyline: function(latLonArray, polyLineOptions)
        {

            var leafletLatLongs = [];

            if (latLonArray && latLonArray.length > 0)
            {
                _.each(latLonArray, function(point)
                {
                    if (point[0] && point[1])
                        leafletLatLongs.push(new L.LatLng(parseFloat(point[0]).toFixed(6), parseFloat(point[1]).toFixed(6)));
                });

            }

            var options = { smoothFactor: 1.0, opacity: 1, weight: 2 };
            if (polyLineOptions)
            {
                _.extend(options, polyLineOptions);
            }

            return L.polyline(leafletLatLongs, options);
 
        },

        createHighlight: function(latLonArray, options)
        {
            var polylineOptions = _.defaults({}, options, { color: chartColors.mapSelection });
            return this.createPolyline(latLonArray, polylineOptions);
        },

        addMarkers: function(map, latLonArray)
        {
            var markers = [];
            if (latLonArray && latLonArray.length > 0)
            {
                var leafletLatLongs = [];

                _.each(latLonArray, function (markerOptions)
                {
                    var point = markerOptions.latLng;
                    if (point[0] && point[1])
                    {
                        var latLng = [parseFloat(point[0]).toFixed(6), parseFloat(point[1]).toFixed(6)];
                        var marker = L.marker(latLng, markerOptions.options);
                        marker.addTo(map);
                        markers.push(marker);
                    }
                });

            }

            return markers;
        },

        calculateAndAddMileMarkers: function(map, dataParser, maxMarkers)
        {
            var markers = this.calculateMileMarkers(dataParser, maxMarkers);
            _.each(markers, function(markerOptions)
            {
                markerOptions.options.icon = new LeafletIcons.MileMarker(markerOptions);
            });

            return this.addMarkers(map, markers);
        },

        addStartMarker: function(map, latLng)
        {
            var marker =
            {
                latLng: latLng,
                options: {}
            };

            marker.options.icon = new LeafletIcons.StartMarker(marker);
            return this.addMarkers(map, [marker]);
        },

        addFinishMarker: function(map, latLng)
        {
            var marker =
            {
                latLng: latLng,
                options: {}
            };

            marker.options.icon = new LeafletIcons.FinishMarker(marker);
            return this.addMarkers(map, [marker]);
        },

        calculateMileMarkers: function(dataParser, maxMarkers)
        {
            var markers = [];
            var latLonArray = dataParser.getLatLonArray();
            if (latLonArray)
            {
                var distances = dataParser.getDataByChannel("Distance");
                var intervals = this.calculateMileMarkerInterval(distances[distances.length - 1][1], maxMarkers);
                var nextMarker = intervals.distanceBetweenMarkers;

                var units = TP.utils.units.getUnitsLabel("distance");
                var markerNumber = intervals.countBy;

                // array index 0 = ms offset, 1 = distance (in meters?)
                for (var i = 0; i < distances.length; i++)
                {
                    if (distances[i][1] >= nextMarker && dataParser.getLatLongByIndex(i))
                    {
                        var latLong = dataParser.getLatLongByIndex(i);
                        markers.push({ latLng: [latLong.lat, latLong.lng], options: { riseOnHover: true, title: markerNumber + " " + units, number: markerNumber } });
                        nextMarker += intervals.distanceBetweenMarkers;
                        markerNumber += intervals.countBy;
                    }
                }
            }
            return markers;
        },

        calculateMileMarkerInterval: function(totalDistance, maxMarkers)
        {
            // 1k or 1 mile
            var baseInterval = theMarsApp.user.get("units") === TP.utils.units.constants.English ? 1609.34 : 1000;

            var maxMarkersToDisplay = maxMarkers ? maxMarkers : 10;
            var totalIntervals = totalDistance / baseInterval;
            var skip = Math.round(totalIntervals / maxMarkersToDisplay);
            if (skip < 1)
                skip = 1;

            return { distanceBetweenMarkers: baseInterval * skip, countBy: skip };
        },

        removeItemsFromMap: function(map, items)
        {
            if(!map || !items)
            {
                return;
            }
            _.each(items, function(item)
            {
                if(_.isArray(item))
                {
                    this.removeItemsFromMap(map, item);
                }
                else
                {
                    if(_.isFunction(item.removeFrom))
                    {
                        item.removeFrom(map);
                    }
                    else
                    {
                        map.removeLayer(item);
                    }
                }
            }, this);
        }

    };
    
});
