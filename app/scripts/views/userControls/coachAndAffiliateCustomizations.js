define(
[
    "underscore",
    "utilities/color"
],
function (_, colorUtils)
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
            _.bindAll(this, "updateHeaderColorsFromLogo");
            this.$("#topLogo").on("load", this.updateHeaderColorsFromLogo);
        },

        updateHeaderColorsFromLogo: function()
        {
            var imageColor = this.getLogoColor();
            this.updateHeaderColors(imageColor);
        },

        updateHeaderColors: function(colorData)
        {
            this.setBackgroundColors(colorData);
            this.setTextColors(colorData);
        },

        getLogoColor: function()
        {
            var logoImg = this.$("#topLogo")[0];
            return colorUtils.getImageColorAtRightEdge(logoImg);
        },

        setBackgroundColors: function(colorData)
        {
            var bgColor = colorData.rgb;

            // set the top bar
            this.$("#userControlsBackground").css("background-color", bgColor);

            // set the menu arrow. since it comes and goes we need a class instead of setting it directly
            var cssRule = ".accountSettings .hoverBox .colored { background-color: " + bgColor + "; }";
            $("<style>").prop("type", "text/css").html(cssRule).appendTo("head");
        },

        setTextColors: function(colorData)
        {
            var grayscaleBackground = colorData.gray;
            var normalGrayValue = 180;
            var normalGrayOpacity = 0.75;
            var hoverGrayValue = 255;
            var hoverGrayOpacity = 0.8;

            if (grayscaleBackground > 128)
            {
                hoverGrayValue = 0;
                normalGrayValue = 128;
            }

            // text color value of username label
            var normalTextColor = "rgba(" + normalGrayValue + "," + normalGrayValue + "," + normalGrayValue + "," + normalGrayOpacity + ")";
            this.$(".rightNavigation .personHeaderButtons label").css("color", normalTextColor);

            // hover state of username label
            var hoverTextColor = "rgba(" + hoverGrayValue + "," + hoverGrayValue + "," + hoverGrayValue + "," + hoverGrayOpacity + ")";
            this.$(".headerRollOver").hover(
                function()
                {
                    $(this).find("label").css('color', hoverTextColor);
                },
                function()
                {
                    $(this).find("label").css('color', normalTextColor);
                });
        }

    };

    return coachAndAffiliateCustomizations;
});