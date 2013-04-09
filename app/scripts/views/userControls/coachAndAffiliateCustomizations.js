define(
[
    "underscore",
    "utilities/color",
    "models/imageData"
],
function(_, colorUtils, ImageData)
{
    var coachAndAffiliateCustomizations =
    {

        initializeCoachAndAffiliateCustomizations: function()
        {
            _.bindAll(this, "updateHeaderColorsFromImageData");
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

                this.loadLogoImageData(logoUrl);
            }
        },

        loadLogoImageData: function(logoUrl)
        {
            var self = this;
            var imageData = new ImageData({ url: logoUrl });
            var onDataLoaded = function()
            {
                var img = $("<img/>");
                img.attr("src", imageData.get("data"));
                img.load(function()
                {
                    self.updateHeaderColorsFromImageData(this);
                });
            }
            imageData.getImageData().done(onDataLoaded);
        },

        updateHeaderColorsFromImageData: function(img)
        {
            var imageColor = colorUtils.getImageColorAtRightEdge(img);
            this.updateHeaderColors(imageColor);
        },

        updateHeaderColors: function(colorValues)
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
