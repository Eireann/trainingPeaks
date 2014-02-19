define(
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
                expect(colorValues.r).to.equal(r);
                expect(colorValues.g).to.equal(g);
                expect(colorValues.b).to.equal(b);
                expect(colorValues.gray).to.equal(gray);
                expect(colorValues.a).to.equal(a);
            };

            describe("get image color at right edge", function()
            {
                it("Should return correct values for a black image", function(done)
                {
                    var img = $("<img/>")[0];
                    img.src = blackImageData;

                    img.loaded = false;
                    $(img).load(function() { this.loaded = true; });

                    Q()
                    .until(function()
                    {
                        return img.loaded;
                    }, "The image should have loaded", 100)
                    .then(function()
                    {
                        var colorValues = colorUtils.getImageColorAtRightEdge(img);
                        assertColors(colorValues, 0, 0, 0, 1, 0);
                    })
                    .nodeify(done);

                });

                it("Should return correct values for a white image", function(done)
                {
                    var img = $("<img/>")[0];
                    img.src = whiteImageData;

                    img.loaded = false;
                    $(img).load(function() { this.loaded = true; });

                    Q()
                    .then(function()
                    {
                        return img.loaded;
                    }, "The image should have loaded", 100)
                    .then(function()
                    {
                        var colorValues = colorUtils.getImageColorAtRightEdge(img);
                        assertColors(colorValues, 255, 255, 255, 1, 255);
                    })
                    .nodeify(done);

                });

                it("Should return correct values for a red image", function(done)
                {
                    var img = $("<img/>")[0];
                    img.src = redImageData;

                    img.loaded = false;
                    $(img).load(function() { this.loaded = true; });

                    Q()
                    .until(function()
                    {
                        return img.loaded;
                    }, "The image should have loaded", 100)
                    .then(function()
                    {
                        var colorValues = colorUtils.getImageColorAtRightEdge(img);
                        assertColors(colorValues, 237, 28, 36, 1, 73);
                    })
                    .nodeify(done);

                });
            });

        });
    }
});
