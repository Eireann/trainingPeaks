﻿requirejs(
[
    "jquery",
    "utilities/color"
],
function($, colorUtils)
{

    // won't run on command line because of canvas
    if (typeof window !== 'undefined' && typeof global === 'undefined')
    {
        describe("color utilities", function()
        {

            var blackImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAYCAIAAACNybHWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAgSURBVEhLY2AYBaMhMBoCoyEwGgKjITAaAqMhMLRDAAAI0AABKRlY/QAAAABJRU5ErkJggg==";
            var whiteImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAYCAIAAACNybHWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA1SURBVEhLY/z//z8DzQATzUwGGTxqOq7gHQ2Z0ZAhNeuNppnRNDOaZkgNgdE0Q2qI0bacAQAtewMtQsbcOwAAAABJRU5ErkJggg==";
            var redImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAYCAIAAACNybHWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA0SURBVEhLY3wro8JAM8BEM5NBBo+ajit4R0NmNGRIzXqjaWY0zYymGVJDYDTNkBpitC1nADf0AV1FoyVzAAAAAElFTkSuQmCC";

            var assertColors = function(colorValues, r, g, b, a, gray)
            {
                expect(colorValues.r).toBe(r);
                expect(colorValues.g).toBe(g);
                expect(colorValues.b).toBe(b);
                expect(colorValues.gray).toBe(gray);
                expect(colorValues.a).toBe(a);
            };

            describe("get image color at right edge", function()
            {
                it("Should return correct values for a black image", function()
                {
                    var img = $("<img/>")[0];
                    img.src = blackImageData;

                    img.loaded = false;
                    $(img).load(function() { this.loaded = true; });
                    waitsFor(function()
                    {
                        return img.loaded;
                    }, "The image should have loaded", 100);

                    runs(function()
                    {
                        var colorValues = colorUtils.getImageColorAtRightEdge(img);
                        assertColors(colorValues, 0, 0, 0, 1, 0);
                    });
                });

                it("Should return correct values for a white image", function()
                {
                    var img = $("<img/>")[0];
                    img.src = whiteImageData;

                    img.loaded = false;
                    $(img).load(function() { this.loaded = true; });
                    waitsFor(function()
                    {
                        return img.loaded;
                    }, "The image should have loaded", 100);

                    runs(function()
                    {
                        var colorValues = colorUtils.getImageColorAtRightEdge(img);
                        assertColors(colorValues, 255, 255, 255, 1, 255);
                    });
                });

                it("Should return correct values for a red image", function()
                {
                    var img = $("<img/>")[0];
                    img.src = redImageData;

                    img.loaded = false;
                    $(img).load(function() { this.loaded = true; });
                    waitsFor(function()
                    {
                        return img.loaded;
                    }, "The image should have loaded", 100);

                    runs(function()
                    {
                        var colorValues = colorUtils.getImageColorAtRightEdge(img);
                        assertColors(colorValues, 237, 28, 36, 1, 73);
                    });
                });
            });

        });
    }
});