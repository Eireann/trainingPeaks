﻿define(
[
    "leaflet"
],
function ()
{
    var map = null;

    var osmURL = "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg";
    var cloudmadeURL = "http://b.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/1/256/{z}/{x}/{y}.png";
    var leafletURL = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";

    return function(container, latLongArray)
    {
        if (!map)
        {
            var osmLayer = new L.TileLayer(osmURL);
            var cloudmadeLayer = new L.TileLayer(cloudmadeURL);
            var leafletLayer = new L.TileLayer(leafletURL);

            var mapConfig =
            {
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: true,
                layers: [osmLayer],
                center: new L.LatLng(40.012369, -105.132353),
                zoom: 8
            };

            var baseMaps =
            {
                "OSM": osmLayer,
                "Cloudmade": cloudmadeLayer,
                "Leaflet": leafletLayer
            };

            map = L.map(container, mapConfig);
            L.control.layers(baseMaps).addTo(map);
        }

        if (latLongArray && latLongArray.length > 0)
        {
            var leafletLatLongs = [];

            _.each(latLongArray, function(point)
            {
                if (point[0] && point[1])
                    leafletLatLongs.push(new L.LatLng(point[0], point[1]));
            });

            var polyline = L.polyline(leafletLatLongs, { color: "red", smoothFactor: 1.0, opacity: 1, weight: 5 }).addTo(map);
            map.fitBounds(polyline.getBounds());
        }

    };
});
