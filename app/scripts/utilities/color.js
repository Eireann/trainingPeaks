define(
[
], function()
{
    var colorUtils = {

        ColorValues: function (r, g, b, a)
        {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            this.rgb = "rgb(" + r + "," + g + "," + b + ")";
            this.rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";
            this.gray = colorUtils.colorToGrayscale(r, g, b);
        },

        getImageColorAtRightEdge: function(img)
        {
            xOffset = img.width - 1;
            yOffset = Math.round(img.height / 2);
            return this.getImageColor(img, xOffset, yOffset);
        },

        getImageColor: function(img, xOffset, yOffset)
        {
            var canvas = this.createCanvasFromImage(img);
            var colorData = canvas.getContext('2d').getImageData(xOffset, yOffset, 1, 1).data;
            return new colorUtils.ColorValues(colorData[0], colorData[1], colorData[2], colorData[3]);
        },

        createCanvasFromImage: function(img)
        {
            var canvas = $('<canvas/>')[0];
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
            return canvas;
        },

        /*
        calculates a weighted grayscale
        http://stackoverflow.com/questions/687261/converting-rgb-to-grayscale-intensity 
        */
        colorToGrayscale: function(R, G, B)
        {
            return Math.round((0.2126 * R) + (0.7152 * G) + (0.0722 * B));
        },

        darkenOrLighten: function(originalColorValues, percent)
        {
            var r = this.limitRange(Math.round(originalColorValues.r * percent));
            var g = this.limitRange(Math.round(originalColorValues.g * percent));
            var b = this.limitRange(Math.round(originalColorValues.b * percent));
            return new this.ColorValues(r, g, b, originalColorValues.a);
        },

        limitRange: function(intValue)
        {
            if(intValue < 0)
            {
                return 0;
            }

            if(intValue > 255)
            {
                return 255;
            }

            return intValue;
        }

    };

    return colorUtils;
});