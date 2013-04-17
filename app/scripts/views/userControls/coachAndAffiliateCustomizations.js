define(
[
    "underscore",
    "utilities/color",
    "utilities/affiliates"
],
function(_, colorUtils, affiliateUtils)
{
    var coachAndAffiliateCustomizations =
    {

        coachAndAffiliateEvents:
        {
            "click .personHeaderLogo": "onLogoClicked"
        },

        initializeCoachAndAffiliateCustomizations: function()
        {
            _.bindAll(this, "updateHeaderColorsFromImageData");
            _.extend(this.events, this.coachAndAffiliateEvents);
            this.on("render", this.setupHeader, this);
        },

        setupHeader: function()
        {
            if (theMarsApp.user.get("settings.account") && !this.affiliateHeaderLoaded)
            {
                if (affiliateUtils.isCoachedAccount())
                {
                    this.loadCoachLogoImageData();
                    this.$("#userControlsBackground").addClass("coachBanner");
                } else if (affiliateUtils.isAffiliate())
                {
                    affiliateUtils.loadAffiliateStylesheet();
                    this.$("#userControlsBackground").addClass("affiliateBanner");
                } 
                this.affiliateHeaderLoaded = true;
            }
        },

        loadCoachLogoImageData: function()
        {
            _.bindAll(this, "onLogoDataLoaded");
            affiliateUtils.loadLogoImageData().done(this.onLogoDataLoaded);
        },

        onLogoDataLoaded: function(imageData)
        {
            var logo = $("<img />");
            logo.attr("src", imageData);
            var self = this;
            logo.load(function()
            {
                self.$(".personHeaderLogo").css("background-image", "none");
                self.$(".personHeaderLogo").append(logo);
                self.updateHeaderColorsFromImageData(this);
            });
        },

        updateHeaderColorsFromImageData: function(img)
        {
            var imageColor = colorUtils.getImageColorAtRightEdge(img);
            this.setBackgroundColors(imageColor);
            this.setTextColors(imageColor);
        },

        setBackgroundColors: function(colorValues)
        {
            var bgColor = colorValues.rgb;

            // set the top bar
            this.$("#userControlsBackground").css("background-color", bgColor);

            // set the menu arrow. since it comes and goes we need a class instead of setting it directly
            // usually make it a little darker than the bg, unless the bg is already pretty dark
            var arrowBgColor = colorValues.gray <= 32 ? colorUtils.lighten(colorValues) : colorUtils.darken(colorValues);
            var cssRule = ".accountSettings .hoverBox .colored { background-color: " + arrowBgColor.rgb + "; }";
            $("<style>").prop("type", "text/css").html(cssRule).appendTo("head");
        },

        setTextColors: function(colorValues)
        {
            if (colorValues.gray > 160)
            {
                this.$("#userControlsBackground").addClass("lightBackground").removeClass("darkBackground");
            } else
            {
                this.$("#userControlsBackground").addClass("darkBackground").removeClass("lightBackground");
            }

        },

        onLogoClicked: function(e)
        {
            var linkUrl = affiliateUtils.getHeaderLinkUrl();
            if (linkUrl)
            {
                window.open(linkUrl);
            }
        }

    };

    return coachAndAffiliateCustomizations;
});
