define(
[
    "underscore",
    "utilities/color"
],
function(_, colorUtils)
{
    var coachAndAffiliateCustomizations =
    {

        initializeCoachAndAffiliateCustomizations: function()
        {
            _.bindAll(this, "updateHeaderColorsFromLogo", "getImageData");
            this.on("render", this.setupHeaderLogo, this);
        },

        setupHeaderLogo: function()
        {
            var headerImageUrl = theMarsApp.user.get("settings.account.headerImageUrl");
            if (headerImageUrl)
            {
                var $logo = this.$("#topLogo");

                var logoUrl = headerImageUrl.indexOf("http") === 0 ? headerImageUrl : theMarsApp.wwwRoot + headerImageUrl;

                if($logo.attr("src") !== logoUrl)
                {
                    $logo.attr("src", logoUrl);
                }

                $logo.on("load", this.updateHeaderColorsFromLogo);
            }
        },

        updateHeaderColorsFromLogo: function()
        {
            var logoImg = this.$("#topLogo")[0];
            var imageColor = colorUtils.getImageColorAtRightEdge(logoImg);
            this.updateHeaderColors(imageColor, logoImg.height);
        },

        updateHeaderColors: function(colorValues, height)
        {
            this.setBackgroundColors(colorValues);
            this.setTextColors(colorValues);
        },

        setBackgroundColors: function(colorValues)
        {
            var bgColor = colorValues.rgb;

            // set the top bar
            this.$("#userControlsBackground").addClass("coachBanner");
            this.$("#userControlsBackground").css("background-color", bgColor);

            // set the menu arrow. since it comes and goes we need a class instead of setting it directly
            // usually make it a little darker than the bg, unless the bg is already pretty dark
            var valueMultiplier = colorValues.gray <= 32 ? 1.2 : 0.8;
            var arrowBgColor = colorUtils.darkenOrLighten(colorValues, valueMultiplier);
            var cssRule = ".accountSettings .hoverBox .colored { background-color: " + arrowBgColor.rgb + "; }";
            $("<style>").prop("type", "text/css").html(cssRule).appendTo("head");
        },

        setTextColors: function(colorValues)
        {
            var grayscaleBackground = colorValues.gray;
            var normalGrayValue = 192;
            var normalGrayOpacity = 0.80;
            var hoverGrayValue = 255;
            var hoverGrayOpacity = 0.8;

            if (grayscaleBackground > 128)
            {
                hoverGrayValue = 0;
                normalGrayValue = 64;
            }

            // text color value of username label
            var normalTextColor = "rgba(" + normalGrayValue + "," + normalGrayValue + "," + normalGrayValue + "," + normalGrayOpacity + ")";
            this.$(".personHeaderButtons:not(.upgradeButton) label").css("color", normalTextColor);
            this.$(".headerPipe").css("color", normalTextColor);

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