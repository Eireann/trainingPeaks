requirejs(
[
    "app",
    "utilities/mapping/mapUtils"
],
function(app, mapUtils)
{
    describe("MapUtils", function()
    {
        it("should calculate mile marker intervals", function()
        {
            var interval = mapUtils.calculateMileMarkerInterval(10, 10);
            expect(interval.distanceBetweenMarkers).toBe(1000);
            expect(interval.countBy).toBe(1);
            
            interval = mapUtils.calculateMileMarkerInterval(30000, 20);
            expect(interval.distanceBetweenMarkers).toBe(2000);
            expect(interval.countBy).toBe(2);
        });

        it("should calculate mile markers", function()
        {
            var dataParser =
            {
                getLatLonArray: function()
                {
                    return [[1,1],[2,2],[3,3],[4,4]];
                },
                getDataByChannel: function ()
                {
                    return [[0, 0], [1000, 1000], [2000, 2000], [3000, 3000]];
                }
            };

            spyOn(mapUtils, "calculateMileMarkerInterval").andReturn(
                { distanceBetweenMarkers: 1000, countBy: 1 }
            );

            var markers = mapUtils.calculateMileMarkers(dataParser, null);
            expect(markers.length).toBe(3);
            for (var i = 0; i < markers.length; i++)
            {
                var marker = markers[i];
                expect(marker.latLng).toEqual([i + 2, i + 2]);
                expect(marker.options.title).toEqual((i + 1) + " km");
            }
        });
    });
});