define(
[

], function ()
{
    var imageUtils = {

        getImageColorAtRightEdge: function(img)
        {
            xOffset = img.width;
            yOffset = Math.round(img.height / 2);
            return this.getImageColor(img, xOffset, yOffset);
        },

        getImageColor: function(img, xOffset, yOffset)
        {
            var canvas = this.createCanvasFromImage(img);
            return canvas.getContext('2d').getImageData(xOffset, yOffset, 1, 1).data;
        },

        createCanvasFromImage: function(img)
        {
            var canvas = $('<canvas/>')[0];
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
            return canvas;
        }

    };

    return imageUtils;
});