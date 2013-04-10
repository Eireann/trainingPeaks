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
            return;
            var headerImageUrl = theMarsApp.user.get("settings.account.headerImageUrl");
            if (headerImageUrl)
            {
                this.setLogoImage(headerImageUrl);
                this.setAffiliateOrCoach();
                this.loadLogoImageData(logoUrl);
            }
        },

        setAffiliateOrCoach: function()
        {
            this.$("#userControlsBackground").addClass("coachBanner");
        },

        setLogoImage: function(logoUrl)
        {
                var $logo = this.$("#topLogo");

                if(logoUrl.indexOf("http") !== 0)
                {
                    logoUrl = theMarsApp.wwwRoot + logoUrl;      
                }

                if($logo.attr("src") !== logoUrl)
                {
                    $logo.attr("src", logoUrl);
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
            };
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
            this.$("#userControlsBackground").css("background-color", bgColor);

            // set the menu arrow. since it comes and goes we need a class instead of setting it directly
            // usually make it a little darker than the bg, unless the bg is already pretty dark
            var valueMultiplier = colorValues.gray <= 32 ? 1.3 : 0.7;
            var arrowBgColor = colorUtils.darkenOrLighten(colorValues, valueMultiplier);
            var cssRule = ".accountSettings .hoverBox .colored { background-color: " + arrowBgColor.rgb + "; }";
            $("<style>").prop("type", "text/css").html(cssRule).appendTo("head");
        },

        setTextColors: function(colorValues)
        {
            if (colorValues.gray > 128)
            {
                this.$("#userControlsBackground").addClass("lightBackground").removeClass("darkBackground");
            } else
            {
                this.$("#userControlsBackground").addClass("darkBackground").removeClass("lightBackground");
            }

        }

    };

    return coachAndAffiliateCustomizations;
});
