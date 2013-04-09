define(
[
    "underscore",
    "utilities/image"
],
function (_, imageUtils)
{
    var coachAndAffiliateCustomizations =
    {

        initializeCoachAndAffiliateCustomizations: function()
        {
            this.on("render", this.updateHeaderColorFromLogoOnLoad, this);
        },

        updateHeaderColorFromLogoOnLoad: function()
        {
            // only for coaches / affiliates - how?
            _.bindAll(this, "updateHeaderColorFromLogo");
            this.$("#topLogo").on("load", this.updateHeaderColorFromLogo);
        },

        updateHeaderColorFromLogo: function()
        {

            var logoImg = this.$("#topLogo")[0];
            var colorData = imageUtils.getImageColorAtRightEdge(logoImg);
            // we can't just join colorData because it's a Uint8ClampedArray
            //var rgbaColor = "rgba(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + "," + colorData[3] + ")";
            var rgbColor = "rgb(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + ")";
            this.$("#userControlsBackground").css("background-color", rgbColor);
        }

    };

    return coachAndAffiliateCustomizations;
});