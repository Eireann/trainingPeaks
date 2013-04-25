﻿define(
[
    "TP"
],
function (TP)
{
    var ImageData = TP.Model.extend(
    {
        url: function ()
        {
            return theMarsApp.apiRoot + "/WebApiServer/images/v1/imagedata";
        },

        defaults:
        {
            url: "",
            data: ""
        },

        getImageData: function()
        {
            return this.save();
        }
    });

    return ImageData;
});
