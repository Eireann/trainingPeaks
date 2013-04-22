define(
[
    "TP"
],
function (TP)
{
    var ImageData = TP.Model.extend(
    {
        url: function ()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Images/V1/ImageData";
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
