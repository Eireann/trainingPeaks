define(
[
    "jquery",
    "underscore",
    "utilities/color",
    "utilities/affiliates"
],
function($, _, colorUtils, affiliateUtils)
{
    var coachAndAffiliateCustomizations =
    {

        coachAndAffiliateEvents:
        {
            "click .personHeaderLogo": "onLogoClicked"
        },

        initializeCoachAndAffiliateCustomizations: function()
        {
            _.extend(this.events, this.coachAndAffiliateEvents);

            // temporary until we finish coach/affiliate customizations
            this.on("render", this.setupBetaHeader);

            // old implementation, left this here until we decide direction of coach customizations 
            //_.bindAll(this, "updateHeaderColorsFromImageData");
            //this.on("render", this.setupHeader, this);
        },

        setupBetaHeader: function()
        {
            if(affiliateUtils.isCoachedAccount() || affiliateUtils.isAffiliate())
            {
                this.$(".personHeaderLogo").addClass("coached");
            }
        },

        setupHeader: function()
        {
            if (affiliateUtils.isCoachedAccount())
            {
                this.$("#userControlsBackground").addClass("coachBanner");
            } else if (affiliateUtils.isAffiliate())
            {
                this.$("#userControlsBackground").addClass("affiliateBanner");
            }

            if(!this.affiliateHeaderLoaded)
            {
                if (affiliateUtils.isCoachedAccount())
                {
                    this.loadCoachLogoImageData();
                } else if (affiliateUtils.isAffiliate())
                {
                    affiliateUtils.loadAffiliateStylesheet();
                } 
                this.affiliateHeaderLoaded = true;
            }
        },

        loadCoachLogoImageData: function()
        {
            var $background = this.$("#userControlsBackground").css({ visibility: "hidden" });
            affiliateUtils.loadLogoImageData()
                .done(_.bind(this.onLogoDataLoaded, this))
                .fail(function()
                {
                    $background.css({visibility: "visible"}).removeClass("coachBanner");
                });
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
                self.$("#userControlsBackground").css({ visibility: "" });
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
