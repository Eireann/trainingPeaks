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

        coachAndAffiliateEvents:
        {
            "click #topLogo": "onLogoClicked"
        },

        initializeCoachAndAffiliateCustomizations: function()
        {
            _.bindAll(this, "updateHeaderColorsFromImageData");
            _.extend(this.events, this.coachAndAffiliateEvents);
            this.on("render", this.setupHeader, this);
        },

        setupHeader: function()
        {
            if (this.userHasAffiliateAccount())
            {
                this.setLogoImageSrc();
            } else if (this.userHasCoachAccount())
            {
                this.loadLogoImageData();
                this.$("#userControlsBackground").addClass("coachBanner");
            }
        },

        userHasAffiliateAccount: function()
        {
            var logoUrl = theMarsApp.user.get("settings.account.headerImageUrl");
            if(logoUrl && logoUrl.indexOf("training_peaks_banner") >= 0)
            {
                return false;
            }

            var affiliateCode = theMarsApp.user.get("settings.affiliate.affiliateCode");
            switch(affiliateCode)
            {
                case "timextrainer":
                    return true;
                case "runnersworld":
                    return true;
                default:
                    return false;
            }
            return false;
        },

        userHasCoachAccount: function()
        {
            var logoUrl = theMarsApp.user.get("settings.account.headerImageUrl");
            if(logoUrl && !this.userHasAffiliateAccount() && logoUrl.indexOf("training_peaks_banner") < 0)
            {
                return true;
            }
            return false;
        },

        getLogoUrl: function()
        {
            var logoUrl = theMarsApp.user.get("settings.account.headerImageUrl");
            if(logoUrl.indexOf("http") !== 0)
            {
                logoUrl = theMarsApp.wwwRoot + logoUrl;      
            }
            return logoUrl;
        },

        setLogoImageSrc: function()
        {
            var logoUrl = this.getLogoUrl();
            this.$("#topLogo").attr("src", logoUrl);
        },

        loadLogoImageData: function()
        {
            var self = this;
            var logoUrl = this.getLogoUrl();
            var imageData = new ImageData({ url: logoUrl });
            var onDataLoaded = function()
            {
                var logo = self.$("#topLogo");
                logo.attr("src", imageData.get("data"));
                logo.load(function()
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

        },

        onLogoClicked: function(e)
        {
            var linkUrl = theMarsApp.user.get("settings.account.headerLink");
            if(linkUrl)
            {
                window.open(linkUrl);
            }
        }

    };

    return coachAndAffiliateCustomizations;
});
