define(
[
    "utilities/mapping/mapUtils"
],
function(mapUtils)
{
    describe("MapUtils", function()
    {
        it("should calculate mile marker intervals", function()
        {
            var interval = mapUtils.calculateMileMarkerInterval(10, 10);
            expect(interval.distanceBetweenMarkers).to.equal(1000);
            expect(interval.countBy).to.equal(1);

            interval = mapUtils.calculateMileMarkerInterval(30000, 20);
            expect(interval.distanceBetweenMarkers).to.equal(2000);
            expect(interval.countBy).to.equal(2);
        });

        it("should calculate mile markers", function()
        {
            var latLongs = [[1,1],[2,2],[3,3],[4,4]];
            var graphData =
            {
                getLatLonArray: function()
                {
                    return latLongs;
                },
                getDataByAxisAndChannel: function ()
                {
                    return [[0, 0], [1000, 1000], [2000, 2000], [3000, 3000]];
                },
                getLatLongByIndex: function(i)
                {
                    return { lat: latLongs[i][0], lng: latLongs[i][1] };
                }
            };

            sinon.stub(mapUtils, "calculateMileMarkerInterval").returns(
                { distanceBetweenMarkers: 1000, countBy: 1 }
            );

            var markers = mapUtils.calculateMileMarkers(graphData, null);
            expect(markers.length).to.equal(3);
            for (var i = 0; i < markers.length; i++)
            {
                var marker = markers[i];
                expect(marker.latLng).to.eql([i + 2, i + 2]);
                expect(marker.options.title).to.eql((i + 1) + " km");
            }
        });
    });
});
