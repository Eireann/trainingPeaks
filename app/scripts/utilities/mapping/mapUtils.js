define(
[
    "TP",
    "leaflet",
    "leafletGoogleTiles",
    "./leafletIcons"
],
function(
    TP,
    Leaflet,
    LeafletGoogleTiles,
    LeafletIcons
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
            var gmapLayer = new L.Google('ROADMAP');
            var gTerrainLayer = new L.Google("TERRAIN");

            // Leaflet needs to know where to find images
            L.Icon.Default.imagePath = theMarsApp.assetsRoot + "images/leaflet";

            var mapConfig =
            {
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: true,
                layers: [gTerrainLayer],
                center: new L.LatLng(40.012369, -105.132353),
                zoom: 8
            };

            var baseMaps =
            {
                "Terrain": gTerrainLayer,
                "Google": gmapLayer,
                "OSM": osmLayer,
                "Cloudmade": cloudmadeLayer,
                "Leaflet": leafletLayer
            };

            var map = L.map(container, mapConfig);
            L.control.layers(baseMaps).addTo(map);

            return map;
        },

        setMapData: function(map, latLonArray)
        {
            if (latLonArray && latLonArray.length > 0)
            {
                var leafletLatLongs = [];

                _.each(latLonArray, function (point)
                {
                    if (point[0] && point[1])
                        leafletLatLongs.push(new L.LatLng(parseFloat(point[0]).toFixed(6), parseFloat(point[1]).toFixed(6)));
                });

                var polyline = L.polyline(leafletLatLongs, { color: "red", smoothFactor: 1.0, opacity: 1, weight: 2 }).addTo(map);
                map.fitBounds(polyline.getBounds());
            }
        },

        highlight: function(map, latLonArray)
        {
            if (latLonArray && latLonArray.length > 0)
            {
                var leafletLatLongs = [];

                _.each(latLonArray, function (point)
                {
                    if (point[0] && point[1])
                        leafletLatLongs.push(new L.LatLng(parseFloat(point[0]).toFixed(6), parseFloat(point[1]).toFixed(6)));
                });

                var polyline = L.polyline(leafletLatLongs, { color: "blue", smoothFactor: 1.0, opacity: 0.7, weight: 4 }).addTo(map);
                //map.fitBounds(polyline.getBounds());
                return polyline;
            }
        },

        addMarkers: function(map, latLonArray)
        {
            if (latLonArray && latLonArray.length > 0)
            {
                var leafletLatLongs = [];

                _.each(latLonArray, function (markerOptions)
                {
                    var point = markerOptions.latLng;
                    if (point[0] && point[1])
                    {
                        var latLng = [parseFloat(point[0]).toFixed(6), parseFloat(point[1]).toFixed(6)];
                        L.marker(latLng, markerOptions.options).addTo(map);
                    }
                });

            }
        },

        calculateAndAddMileMarkers: function(map, dataParser, maxMarkers)
        {
            var markers = this.calculateMileMarkers(dataParser, maxMarkers);
            _.each(markers, function(markerOptions)
            {
                markerOptions.options.icon = new LeafletIcons.MileMarker(markerOptions);
            });

            this.addMarkers(map, markers);
        },

        calculateMileMarkers: function(dataParser, maxMarkers)
        {
            var latLonArray = dataParser.getLatLonArray();
            var distances = dataParser.dataByChannel.Distance;
            var intervals = this.calculateMileMarkerInterval(distances[distances.length - 1][1], maxMarkers);
            var nextMarker = intervals.distanceBetweenMarkers;
            var markers = [];
            var units = TP.utils.units.getUnitsLabel("distance");
            var markerNumber = intervals.countBy;

            // array index 0 = ms offset, 1 = distance (in meters?)
            for(var i = 0; i < distances.length && i < latLonArray.length; i++)
            {
                if (distances[i][1] >= nextMarker)
                {
                    markers.push({ latLng: latLonArray[i], options: { riseOnHover: true, title: markerNumber + " " + units, number: markerNumber } });
                    nextMarker += intervals.distanceBetweenMarkers;
                    markerNumber += intervals.countBy;
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
        }

    };
    
});